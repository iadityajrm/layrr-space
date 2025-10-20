
import React from 'react';
import type { Project, User } from '../types';
import { ArrowLeftIcon, UploadIcon } from '../components/Icons';

interface ProjectDetailPageProps {
  project: Project;
  user: User;
  onBack: () => void;
}

const statusStyles = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Pending Verification': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ project, user, onBack }) => {

  const handleUploadProof = () => {
    // This would trigger a file input dialog
    alert('Upload functionality not implemented in this demo.');
  };
  
  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <button onClick={onBack} className="mb-8 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 flex items-center gap-2">
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
            <div className="flex justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">/{project.slug}</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[project.status]}`}>
                    {project.status}
                </span>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Brand Name</p>
                    <p className="text-gray-900 dark:text-white mt-1">{project.brandName}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Creation Date</p>
                    <p className="text-gray-900 dark:text-white mt-1">{project.createdDate}</p>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Template Type</p>
                    <p className="text-gray-900 dark:text-white mt-1">{project.templateType}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Price</p>
                    <p className="text-gray-900 dark:text-white mt-1">₹{project.price.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/50 p-4 rounded-lg sm:col-span-2">
                    <p className="text-green-700 dark:text-green-300 font-medium">Commission Earned</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">₹{project.commission.toFixed(2)}</p>
                </div>
            </div>

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Proof of Sale</h3>
                {project.proofImageUrl ? (
                     <div className="mt-4">
                        <img src={project.proofImageUrl} alt="Proof of sale" className="rounded-lg max-w-sm w-full shadow-md" />
                     </div>
                ) : (
                    <div className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">No proof uploaded yet. Upload a photo of the vendor's storefront or business card to verify the sale.</p>
                        <button
                            onClick={handleUploadProof}
                            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            <UploadIcon className="w-5 h-5" />
                            Upload Proof
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
