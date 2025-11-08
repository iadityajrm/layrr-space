import React, { useState } from 'react';
import type { Project } from '../types';
import { FolderIcon, TrashIcon } from '../components/Icons';
import { DeleteConfirmationDialog } from '../components/DeleteConfirmationDialog';
import { supabase } from '../src/lib/supabaseClient';

interface ProjectsPageProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
}

const getStatusChipClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'pending_verification':
    case 'pending verification':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onSelectProject, onProjectDelete }) => {
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
        <FolderIcon className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No Projects Yet</h2>
        <p className="mt-2">Get started by selecting a template and making your first sale!</p>
      </div>
    );
  }

  const handleDeleteProject = async (project: Project) => {
    setDeleteProject(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProject) return;
    
    try {
      // Add authorization check - ensure user can only delete their own projects
      // This should be enforced by RLS policies, but we add client-side validation as well
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deleteProject.id);

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Project not found or you do not have permission to delete it');
        }
        if (error.code === '23503') {
          throw new Error('Cannot delete project due to existing dependencies');
        }
        console.error('Error deleting project:', error);
        alert('Failed to delete project: ' + error.message);
        return;
      }

      onProjectDelete?.(deleteProject.id);
      setDeleteProject(null);
      alert('Project deleted successfully');
    } catch (error: any) {
      console.error('Delete error:', error);
      alert('Failed to delete project: ' + (error.message || 'Unknown error'));
    }
  };

  const isDeleteDisabled = (project: Project) => {
    return project.status?.toLowerCase() === 'approved';
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">My Projects</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Project Name</th>
                <th scope="col" className="px-6 py-3">Template</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Created</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr 
                  key={project.id} 
                  className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-150"
                  onClick={() => onSelectProject(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject(project);
                    }
                  }}
                  aria-label={`View details for ${project.project_name || project.id}`}
                >
                  <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {project.project_name || project.id}
                  </th>
                  <td className="px-6 py-4">{Array.isArray(project.templates) ? project.templates[0]?.title : (project.templates as any)?.title || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusChipClass(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Show QR / public url link if present */}
                      {project.slug && (
                        <a 
                          href={project.redirect_url || '#'} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm text-slate-500 hover:underline inline-flex items-center px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="View live project"
                        >
                          View Live
                        </a>
                      )}
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        disabled={isDeleteDisabled(project)}
                        className={`p-1 rounded transition-colors ${
                          isDeleteDisabled(project)
                            ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                            : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={isDeleteDisabled(project) ? 'Approved projects cannot be deleted' : 'Delete project'}
                        aria-label="Delete project"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <DeleteConfirmationDialog
        project={deleteProject!}
        isOpen={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
