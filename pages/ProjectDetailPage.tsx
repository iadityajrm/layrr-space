import React, { useState, useEffect } from 'react';
import type { Project, Profile, Template } from '../types';
import { supabase } from '../src/lib/supabaseClient';
import { ArrowLeftIcon, Upload, CheckCircleIcon, XCircle } from '../components/Icons';

interface ProjectDetailPageProps {
  project: Project;
  user: Profile;
  onBack: () => void;
  onProjectUpdate: (project: Project) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, user, onBack, onProjectUpdate }) => {
  // Verification functions
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setVerificationError('Please upload a JPG or PNG image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setVerificationError('Image size must be less than 5MB');
      return;
    }

    setVerificationImage(file);
    setVerificationError(null);

    // Get location metadata
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationMetadata({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          setLocationMetadata({
            lat: 0,
            lng: 0,
            timestamp: new Date().toISOString()
          });
        }
      );
    }
  };

  const handleVerificationSubmit = async () => {
    if (!verificationImage) {
      setVerificationError('Please select an image first');
      return;
    }

    setVerificationUploading(true);
    setVerificationError(null);

    try {
      // Upload image to Supabase Storage
      const fileExt = verificationImage.name.split('.').pop();
      const fileName = `${currentProject.id}-${Date.now()}.${fileExt}`;
      const filePath = `verification-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-verification')
        .upload(filePath, verificationImage);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-verification')
        .getPublicUrl(filePath);

      // Update project with verification data
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          proof_photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentProject.id);

      if (updateError) {
        throw updateError;
      }

      // Create audit trail
      const { error: auditError } = await supabase
        .from('verification_audits')
        .insert({
          project_id: currentProject.id,
          image_url: publicUrl,
          location_metadata: locationMetadata,
          uploaded_by: user?.id,
          created_at: new Date().toISOString()
        });

      if (auditError) {
        console.warn('Audit trail creation failed:', auditError);
      }

      setVerificationSuccess(true);
      setVerificationImage(null);
      
      // Update current project
      setCurrentProject(prev => ({
        ...prev,
        proof_photo_url: publicUrl
      }));

    } catch (error) {
      console.error('Verification upload error:', error);
      setVerificationError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setVerificationUploading(false);
    }
  };
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Verification section state
  const [verificationImage, setVerificationImage] = useState<File | null>(null);
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [locationMetadata, setLocationMetadata] = useState<{lat: number, lng: number, timestamp: string} | null>(null);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  const generateSlug = (base: string) => {
    return base.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const generatePublicUrl = (slug: string) => {
    const origin = window.location.origin;
    return `${origin}/r/${slug}`;
  };

  const handleLogoUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `${user.id}-${currentProject.id}-logo-${Date.now()}.${ext}`;
    setUploading(true);
    setUploadError(null);
    const { error } = await supabase.storage.from('project_logos').upload(fileName, file);
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return null;
    }
    const { data } = supabase.storage.from('project_logos').getPublicUrl(fileName);
    setUploading(false);
    return data.publicUrl;
  };

  const handlePublish = async () => {
    // Validate status transition
    const currentStatus = currentProject.status || 'unpublished';
    const isApproved = currentStatus === 'approved';
    
    if (isApproved) {
      alert('Cannot modify status of approved projects');
      return;
    }

    setPublishing(true);
    try {
      const newStatus = currentStatus === 'unpublished' ? 'published' : 'unpublished';
      
      // Add user authorization check
      if (currentProject.user_id !== user.id) {
        throw new Error('Unauthorized: You can only modify your own projects');
      }

      const { data, error } = await supabase
        .from('projects')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString()
        })
        .eq('id', currentProject.id)
        .eq('user_id', user.id) // Ensure user owns the project
        .select()
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found or you do not have permission to modify it');
        }
        throw error;
      }

      if (data) {
        setCurrentProject(data);
        onProjectUpdate(data);
        alert(`Project ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
      } else {
        throw new Error('Failed to update project status');
      }
    } catch (e: any) {
      console.error('Publish error:', e);
      alert('Publish error: ' + (e?.message || String(e)));
    } finally {
      setPublishing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Remove frontend slug generation, rely on backend trigger
      const payload: Partial<Project> = {
        ...currentProject,
        updated_at: new Date().toISOString(),
        // The slug will be generated by the backend trigger if not provided or empty
        // The qr_code_url will be generated based on the final slug by the backend or a separate process
        // For now, we'll keep the public_url generation for immediate UI feedback if slug is present
        qr_code_url: currentProject.slug ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${generatePublicUrl(currentProject.slug)}` : null,
      };

      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', currentProject.id)
        .select() // Re-fetch project data
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentProject(data);
        onProjectUpdate(data);
      }
      setSaving(false);
    } catch (e: any) {
      console.error(e);
      alert('Save error: ' + (e?.message || String(e)));
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <button onClick={onBack} className="flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6">
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Projects</span>
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{currentProject.project_name || currentProject.id}</h1>
              <p className="text-slate-500 dark:text-slate-400">Template: {currentProject.templates?.template_name || 'N/A'}</p>
              {!currentProject.templates?.template_category && (
                <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Template category not found. Please reassign a template to this project.
                  </p>
                </div>
              )}
              {currentProject.templates?.template_category && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Category: <span className="font-medium capitalize">{currentProject.templates.template_category}</span>
                </p>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  currentProject.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  currentProject.status === 'published' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {currentProject.status || 'unpublished'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Customize Project</h3>
          {currentProject.templates?.instructions && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{currentProject.templates.instructions}</p>
          )}
          {currentProject.templates?.use_cases && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{currentProject.templates.use_cases}</p>
          )}
          <div className="space-y-4">
            <label className="block text-sm">
              <div className="text-slate-600 dark:text-slate-300 mb-1">Project Name</div>
              <input
                value={currentProject.project_name || ''}
                onChange={(e) => setCurrentProject(prev => ({ ...prev, project_name: e.target.value }))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
              />
            </label>

            {/* Dynamic field mapping based on template category */}
            {currentProject.templates?.field_mapping && currentProject.templates?.template_category && (
              <div className="space-y-4">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {currentProject.templates.template_category} Configuration
                </h4>
                {Object.entries(currentProject.templates.field_mapping).map(([genericField, semanticRole]) => (
                  <label key={genericField} className="block text-sm">
                    <div className="text-slate-600 dark:text-slate-300 mb-1">{semanticRole}</div>
                    <input
                      value={(currentProject as any)[genericField] || ''}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, [genericField]: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
                      placeholder={`Enter ${semanticRole.toLowerCase()}`}
                    />
                  </label>
                ))}
              </div>
            )}
            
            {/* Fallback for missing field_mapping */}
            {!currentProject.templates?.field_mapping && currentProject.templates?.template_category && (
              <div className="space-y-4">
                <h4 className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {currentProject.templates.template_category} Configuration
                </h4>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    Field mapping not configured for this template category. Default fields will be used.
                  </p>
                </div>
                {/* Default data1-data8 fields as fallback */}
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <label key={`data${num}`} className="block text-sm">
                    <div className="text-slate-600 dark:text-slate-300 mb-1">Data Field {num}</div>
                    <input
                      value={(currentProject as any)[`data${num}`] || ''}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, [`data${num}`]: e.target.value }))}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
                      placeholder={`Enter data field ${num}`}
                    />
                  </label>
                ))}
              </div>
            )}

            <label className="block text-sm">
              <div className="text-slate-600 dark:text-slate-300 mb-1">Theme Color</div>
              <input
                type="color"
                value={currentProject.theme_color || '#0ea5a4'}
                onChange={(e) => setCurrentProject(prev => ({ ...prev, theme_color: e.target.value }))}
              />
            </label>

            <label className="block text-sm">
              <div className="text-slate-600 dark:text-slate-300 mb-1">Logo Upload (optional)</div>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  if (!e.target.files || !e.target.files[0]) return;
                  const publicUrl = await handleLogoUpload(e.target.files[0]);
                  if (publicUrl) setCurrentProject(prev => ({ ...prev, logo_url: publicUrl }));
                }}
              />
              {uploading && <div className="text-sm text-slate-500 mt-2">Uploading...</div>}
              {uploadError && <div className="text-sm text-red-500 mt-2">{uploadError}</div>}
            </label>

            <label className="block text-sm">
              <div className="text-slate-600 dark:text-slate-300 mb-1">Slug (public path)</div>
              <input
                value={currentProject.slug || ''}
                onChange={(e) => setCurrentProject(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-3 py-2"
                placeholder="my-awesome-project"
              />
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setCurrentProject(project)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base">Reset</button>
              </div>
              {currentProject.status !== 'approved' && (
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className={`px-4 py-2 text-sm font-medium rounded w-full sm:w-auto ${
                    currentProject.status === 'published' 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {publishing ? 'Processing...' : currentProject.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Verification Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Service Verification</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload a timestamped photo of your completed template to verify service completion.</p>
          
          {currentProject.proof_photo_url && (
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Verification Photo:</p>
              <img 
                src={currentProject.proof_photo_url} 
                alt="Verification" 
                className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Upload Verification Photo
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="verification-upload"
                  disabled={verificationUploading}
                />
                <label
                  htmlFor="verification-upload"
                  className={`cursor-pointer flex flex-col items-center ${verificationUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="w-12 h-12 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {verificationImage ? verificationImage.name : 'Click to upload JPG or PNG (max 5MB)'}
                  </span>
                </label>
              </div>
              {verificationError && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  {verificationError}
                </div>
              )}
            </div>

            {verificationImage && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Image ready for upload</span>
                  </div>
                  <button
                    onClick={() => setVerificationImage(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                {locationMetadata && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Location: {locationMetadata.lat.toFixed(6)}, {locationMetadata.lng.toFixed(6)}
                    <br />
                    Timestamp: {new Date(locationMetadata.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleVerificationSubmit}
              disabled={!verificationImage || verificationUploading}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                !verificationImage || verificationUploading
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {verificationUploading ? 'Uploading...' : 'Submit Verification'}
            </button>

            {verificationSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 dark:text-green-200">Verification photo uploaded successfully!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentProject.qr_code_url && (
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Shareable Link & QR Code</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img src={currentProject.qr_code_url} alt="QR Code" className="w-32 h-32" />
              </div>
              <div className="flex-grow">
                <p className="text-sm text-slate-600 dark:text-slate-400">Your public link:</p>
                <a href={currentProject.slug ? generatePublicUrl(currentProject.slug) : '#'} target="_blank" rel="noreferrer" className="text-primary-600 dark:text-primary-400 font-medium break-all">{currentProject.slug ? generatePublicUrl(currentProject.slug) : 'N/A'}</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
