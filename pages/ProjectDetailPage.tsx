import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const isSuspended = user?.status === 'suspended';
  // Verification functions
  const [verificationProcessing, setVerificationProcessing] = useState(false);
  const [processedInfo, setProcessedInfo] = useState<{ width: number; height: number; sizeKB: number; quality: number } | null>(null);

  const processImage = async (file: File): Promise<File | null> => {
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setVerificationError('Please upload a JPG or PNG image');
        return null;
      }

      // Read into Image element
      const objectUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load image'));
        image.src = objectUrl;
      });

      const maxWidth = 1600;
      const scale = img.width > maxWidth ? maxWidth / img.width : 1;
      const targetWidth = Math.round(img.width * scale);
      const targetHeight = Math.round(img.height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Progressive quality reduction
      let quality = 0.8;
      const minQuality = 0.4;
      const step = 0.05;
      let blob: Blob | null = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (!blob) throw new Error('Failed to encode image');

      while (blob.size > 500 * 1024 && quality - step >= minQuality) {
        quality = +(quality - step).toFixed(2);
        blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (!blob) throw new Error('Failed to encode image');
      }

      // Final check
      if (blob.size > 500 * 1024) {
        setVerificationError('Unable to compress image below 500KB without excessive quality loss.');
        URL.revokeObjectURL(objectUrl);
        return null;
      }

      // Create File from blob; discard original file
      const processedFile = new File([blob], `${(file.name || 'verification')}.jpg`.replace(/\.(png|jpeg|jpg)$/i, '.jpg'), { type: 'image/jpeg' });

      setProcessedInfo({ width: targetWidth, height: targetHeight, sizeKB: Math.round(blob.size / 1024), quality });
      URL.revokeObjectURL(objectUrl);
      return processedFile;
    } catch (e) {
      console.error('Image processing failed:', e);
      setVerificationError(e instanceof Error ? e.message : 'Image processing failed');
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVerificationError(null);
    setVerificationProcessing(true);
    setProcessedInfo(null);

    const processed = await processImage(file);
    if (!processed) {
      setVerificationImage(null);
      setVerificationProcessing(false);
      return;
    }

    setVerificationImage(processed);
    // Set preview URL and timestamp; remove any location collection
    if (previewSrc) {
      URL.revokeObjectURL(previewSrc);
    }
    const objectUrl = URL.createObjectURL(processed);
    setPreviewSrc(objectUrl);
    const now = new Date();
    const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setUploadTimestampStr(ts);
    setVerificationProcessing(false);
  };

  const handleVerificationSubmit = async () => {
    if (isSuspended) {
      alert('Account suspended - please contact support');
      return;
    }
    if (!verificationImage) {
      setVerificationError('Please select an image first');
      return;
    }

    setVerificationUploading(true);
    setVerificationError(null);

    try {
      // Use secure upload API to send file to Cloudinary and record in Supabase
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('Missing auth token. Please re-login.');

      const formData = new FormData();
      formData.append('image', verificationImage);
      formData.append('projectId', currentProject.id);

      const resp = await fetch('/api/upload-verification', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!resp.ok) {
        let errMsg = 'Upload failed';
        try {
          const errJson = await resp.json();
          errMsg = errJson?.error || errMsg;
          if (errJson?.details) errMsg += `: ${errJson.details}`;
        } catch {
          const errText = await resp.text().catch(() => '');
          if (errText) errMsg = errText;
        }
        throw new Error(errMsg);
      }
      const result = await resp.json();
      const publicUrl = result?.url as string;

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
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  
  // Verification section state
  const [verificationImage, setVerificationImage] = useState<File | null>(null);
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [uploadTimestampStr, setUploadTimestampStr] = useState<string | null>(null);
  
  // QR code states
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentProject(project);
  }, [project]);

  // Reset preview and stats whenever the image is removed
  useEffect(() => {
    if (!verificationImage) {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
      }
      setPreviewSrc(null);
      setUploadTimestampStr(null);
      setProcessedInfo(null);
    }
  }, [verificationImage]);

  // Lock background scroll while modal is open and enable ESC to close
  useEffect(() => {
    if (previewOpen) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setPreviewOpen(false);
      };
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [previewOpen]);

  const generateSlug = (base: string) => {
    return base.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const generatePublicUrl = (slug: string) => {
    return `https://www.layrr.space/${slug}`;
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
    if (isSuspended) {
      alert('Account suspended - please contact support');
      return;
    }
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
          {isSuspended && (
            <div className="mb-4 rounded-lg border border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 p-4">
              <p className="font-semibold">Account suspended - please contact support</p>
              <p className="mt-2 text-sm">Your account is suspended. Contact support to restore access.</p>
            </div>
          )}
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
        <div className="p-6 pb-8">
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
                className="w-16 h-10 p-0 border border-slate-300 dark:border-slate-700 rounded-lg bg-transparent cursor-pointer"
                aria-label="Choose theme color"
              />
            </label>

            <label className="block text-sm">
              <div className="text-slate-600 dark:text-slate-300 mb-1">Logo Upload (optional)</div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={async (e) => {
                  if (!e.target.files || !e.target.files[0]) return;
                  const file = e.target.files[0];
                  setLogoFileName(file.name);
                  const publicUrl = await handleLogoUpload(file);
                  if (publicUrl) setCurrentProject(prev => ({ ...prev, logo_url: publicUrl }));
                }}
              />
              <label
                htmlFor="logo-upload"
                className="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                aria-disabled={isSuspended}
              >
                Choose File
              </label>
              {isSuspended && (
                <div className="text-xs text-red-600 mt-2">Account suspended - uploads disabled</div>
              )}
              {logoFileName && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Selected: {logoFileName}</div>
              )}
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
                disabled={isSuspended}
              />
            </label>

            {/* QR Code Component */}
            <div className="mt-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">Public URL</div>
                  <div className="text-primary-600 dark:text-primary-400 font-medium break-all" aria-live="polite">
                    {currentProject.slug ? `https://www.layrr.space/${currentProject.slug}` : 'Enter a slug to generate URL'}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {currentProject.slug ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://www.layrr.space/${currentProject.slug}`)}`}
                      alt={"QR code for " + `https://www.layrr.space/${currentProject.slug}`}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg border border-slate-200 dark:border-slate-700"
                      onLoad={() => setQrLoading(false)}
                      onError={() => { setQrError('Failed to load QR code'); setQrLoading(false); }}
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                      No slug
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    if (!currentProject.slug) return;
                    try {
                      setQrError(null);
                      setQrLoading(true);
                      const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://www.layrr.space/${currentProject.slug}`)}`;
                      const res = await fetch(qrSrc);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `layrr-qr-${currentProject.slug}.png`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    } catch (e) {
                      setQrError('Failed to download QR code');
                    } finally {
                      setQrLoading(false);
                    }
                  }}
                  disabled={!currentProject.slug || qrLoading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!currentProject.slug || qrLoading ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                  aria-label="Download QR code"
                >
                  {qrLoading ? 'Downloading...' : 'Download QR'}
                </button>
                {qrError && <span className="text-sm text-red-600" role="alert">{qrError}</span>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button onClick={handleSave} disabled={saving || isSuspended} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button onClick={() => setCurrentProject(project)} disabled={isSuspended} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">Reset</button>
              </div>
              {currentProject.status !== 'approved' && (
                <button
                  onClick={handlePublish}
                  disabled={publishing || isSuspended}
                  className={`px-4 py-2 text-sm font-medium rounded-lg w-full sm:w-auto ${
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
      <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Service Verification</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload a timestamped photo of your completed template to verify service completion.</p>
          
          {currentProject.proof_photo_url && (
            <div className="mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Verification Photo:</p>
              <img 
                src={currentProject.proof_photo_url} 
                alt="Verification" 
                className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-700 cursor-zoom-in"
                onClick={() => { setPreviewSrc(currentProject.proof_photo_url); setPreviewOpen(true); }}
              />
            </div>
          )}

          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Upload Verification Photo
              </label>
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-slate-400 dark:hover:border-slate-600 transition-colors w-full">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="verification-upload"
                  disabled={verificationUploading || verificationProcessing || isSuspended}
                />
                <label
                  htmlFor="verification-upload"
                  className={`cursor-pointer flex flex-col items-center ${verificationUploading || verificationProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className={`w-12 h-12 text-slate-400 mb-2 ${verificationProcessing ? 'animate-spin' : ''}`} />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {verificationProcessing
                      ? 'Processing image...'
                      : verificationImage
                        ? verificationImage.name
                        : 'Click to upload JPG or PNG'}
                  </span>
                </label>
                {processedInfo && (
                  <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                    Processed: {processedInfo.width}×{processedInfo.height}px · {processedInfo.sizeKB}KB · quality {Math.round(processedInfo.quality * 100)}%
                  </div>
                )}
              </div>
              {verificationError && (
                <div className="mt-2 flex items-center text-red-600 text-sm">
                  <XCircle className="w-4 h-4 mr-1" />
                  {verificationError}
                </div>
              )}
            </div>

            {verificationImage && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 md:col-span-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Image ready for upload</span>
                  </div>
                  <button
                    onClick={() => {
                      setVerificationImage(null);
                      if (previewSrc) {
                        URL.revokeObjectURL(previewSrc);
                      }
                      setPreviewSrc(null);
                      setUploadTimestampStr(null);
                      setProcessedInfo(null);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                {uploadTimestampStr && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Timestamp: {uploadTimestampStr}
                  </div>
                )}
                {processedInfo && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Final size: {processedInfo.sizeKB}KB · Dimensions: {processedInfo.width}×{processedInfo.height}px
                  </div>
                )}
                {previewSrc && (
                  <div className="mt-3">
                    <img
                      src={previewSrc}
                      alt="Preview"
                      className="w-full max-w-md max-h-64 object-contain rounded border border-slate-200 dark:border-slate-700 cursor-zoom-in"
                      onClick={() => setPreviewOpen(true)}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleVerificationSubmit}
              disabled={!verificationImage || verificationUploading || verificationProcessing}
              className={`w-full md:col-span-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                !verificationImage || verificationUploading || verificationProcessing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {verificationUploading ? 'Uploading...' : verificationProcessing ? 'Processing...' : 'Submit Verification'}
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

      {/* Preview Modal */}
      {previewOpen && previewSrc && createPortal(
        (
          <div
            className="fixed inset-0 w-screen h-screen bg-black/70 z-[9999] flex items-center justify-center transition-opacity duration-300"
            onClick={() => setPreviewOpen(false)}
            aria-modal="true"
            role="dialog"
          >
            <div className="relative max-w-[95vw] max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
              <button
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors duration-300"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
              >
                ×
              </button>
              <img
                src={previewSrc}
                alt="Preview"
                className="w-[90vw] h-[80vh] max-w-full max-h-[80vh] object-contain rounded shadow-lg transition-transform duration-300"
              />
            </div>
          </div>
        ),
        document.body
      )}

      {/* QR code handled inline near slug; legacy section removed */}
    </div>
  );
};

export default ProjectDetailPage;
