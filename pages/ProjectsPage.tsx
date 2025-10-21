import React from 'react';
    import type { Project } from '../types';
    import { FolderIcon } from '../components/Icons';

    interface ProjectsPageProps {
      projects: Project[];
      onSelectProject: (project: Project) => void;
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

    export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onSelectProject }) => {
      if (projects.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 dark:text-slate-400">
            <FolderIcon className="h-16 w-16 mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No Projects Yet</h2>
            <p className="mt-2">Get started by selecting a template and making your first sale!</p>
          </div>
        );
      }

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
                    <th scope="col" className="px-6 py-3"><span className="sr-only">View</span></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {project.title || (project as any).assignment_id || project.id}
                      </th>
                      <td className="px-6 py-4">{Array.isArray(project.templates) ? project.templates[0]?.title : (project.templates as any)?.title || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusChipClass(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {/* If template category is Reviews, show customize button */}
                        {((Array.isArray(project.templates) ? project.templates[0] : project.templates) as any)?.category === 'Reviews' ? (
                          <button onClick={() => onSelectProject(project)} className="inline-flex items-center px-3 py-1 rounded-md bg-primary-600 text-white text-sm hover:opacity-90">Customize Review Page</button>
                        ) : (
                          <button onClick={() => onSelectProject(project)} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">View Details</button>
                        )}
                        {/* Show QR / public url link if present */}
                        {project.slug && (
                          <a href={project.public_url || '#'} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:underline">View Live</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    };
