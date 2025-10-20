import React, { useState } from 'react';
import type { Project, Profile } from '../types';
import { supabase } from '../src/lib/supabaseClient';
import { ArrowLeftIcon, UploadCloudIcon } from '../components/Icons';

interface ProjectDetailPageProps {
  project: Project;
  user: Profile;
  onBack: () => void;
  onProjectUpdate: (project: Project) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, user, onBack, onProjectUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleProofUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setUploadError(null);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${project.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proof_uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('proof_uploads')
        .getPublicUrl(filePath);

      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update({ proof_photo_url: publicUrl, status: 'Active' })
        .eq('id', project.id)
        .select(`
          *,
          templates (
            template_name,
            price,
            commission_rate,
            preview_image_url
          )
        `)
        .single();

      if (updateError) {
        throw updateError;
      }
      
      onProjectUpdate(updatedProject as Project);
      alert('Proof uploaded and project activated!');

    } catch (error: any) {
      setUploadError(error.message);
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{project.project_name}</h1>
          <p className="text-slate-500 dark:text-slate-400">Template: {project.templates?.template_name}</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Project Details</h3>
            <dl className="text-sm space-y-3">
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Status</dt><dd className="font-medium text-slate-700 dark:text-slate-300">{project.status}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Slug</dt><dd className="font-medium text-slate-700 dark:text-slate-300">{project.slug}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Created</dt><dd className="font-medium text-slate-700 dark:text-slate-300">{new Date(project.created_at).toLocaleString()}</dd></div>
            </dl>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Proof of Sale</h3>
            {project.proof_photo_url ? (
              <div>
                <img src={project.proof_photo_url} alt="Proof of sale" className="rounded-lg w-full h-auto object-cover mb-4" />
                <p className="text-sm text-green-600 dark:text-green-400">Proof has been uploaded.</p>
              </div>
            ) : (
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <UploadCloudIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleProofUpload} disabled={uploading} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
            {uploading && <p className="text-sm text-slate-500 mt-2">Uploading...</p>}
            {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
