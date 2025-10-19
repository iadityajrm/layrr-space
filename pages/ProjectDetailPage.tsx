import React, { useState, useRef } from 'react';
import type { Project } from '../types';
import { CameraIcon } from '../components/Icons';

interface ProjectDetailPageProps {
  project: Project;
  onUpdateProject: (project: Project) => void;
  onBack: () => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, onUpdateProject, onBack }) => {
  const [formData, setFormData] = useState({
    brandName: project.brandName,
    slug: project.slug,
  });
  const [proofImage, setProofImage] = useState<string | null>(project.proofImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProject({ ...project, ...formData });
    alert('Project updated!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmitForVerification = () => {
    if (!proofImage) {
        alert('Please upload a proof of sale photo.');
        return;
    }
    onUpdateProject({ ...project, ...formData, proofImageUrl: proofImage, status: 'Pending Verification' });
    alert('Project submitted for verification!');
  };

  const livePageUrl = `https://reviews.layrr.space/${formData.slug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(livePageUrl)}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
       <div>
        <button onClick={onBack} className="mb-4 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">
            &larr; Back to Projects
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage project details and submit for verification.</p>
      </div>

      {/* Project Details Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Project Customization</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Brand/Business Name</label>
                <input type="text" name="brandName" id="brandName" value={formData.brandName} onChange={handleInputChange} className="mt-1 block w-full px-4 py-3 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL Slug</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-gray-400">
                        reviews.layrr.space/
                    </span>
                    <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} className="flex-1 block w-full min-w-0 px-4 py-3 rounded-none rounded-r-md border-gray-300 dark:border-gray-600 focus:ring-0 focus:border-primary-500 bg-white dark:bg-gray-700"/>
                </div>
              </div>
            </div>
             <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Live Page QR Code</h3>
                <div className="mt-2 flex items-center gap-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 rounded-lg bg-white p-1"/>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Scan this code to view the live page.</p>
                        <a href={livePageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                            reviews.layrr.space/{formData.slug}
                        </a>
                    </div>
                </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-right rounded-b-lg">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200">
              Publish Changes
            </button>
          </div>
        </form>
      </div>

      {/* Order Completion Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
         <div className="p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Mark as Complete</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">To complete this order and receive your commission, please upload a photo of the template setup at the vendor's location.</p>
            
            <div className="mt-4">
                <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                    {proofImage ? (
                        <img src={proofImage} alt="Proof of sale" className="max-w-full max-h-full object-contain rounded-lg" />
                    ) : (
                        <div className="text-center">
                            <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No photo uploaded</p>
                        </div>
                    )}
                </div>
            </div>
            
            <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                onChange={handleImageUpload}
                className="hidden"
            />

            <div className="mt-5 flex gap-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 transition-colors duration-200"
                >
                  {proofImage ? 'Change Photo' : 'Upload Photo'}
                </button>
                <button 
                  onClick={handleSubmitForVerification}
                  disabled={!proofImage || project.status !== 'Active'}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200 disabled:bg-green-300 dark:disabled:bg-green-800 disabled:cursor-not-allowed"
                >
                  Submit for Verification
                </button>
            </div>
             {project.status !== 'Active' && <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">This project is currently '{project.status}' and cannot be submitted.</p>}
         </div>
      </div>
    </div>
  );
};