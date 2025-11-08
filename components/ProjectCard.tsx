import React from 'react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const statusStyles = {
  Active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  'Pending Verification': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Archived: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full text-left bg-white dark:bg-slate-800/50 rounded-2xl shadow-md p-5 border border-slate-200 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
      <h3 className="font-bold text-slate-900 dark:text-white pr-2">{project.project_name || project.id}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[project.status]}`}>
                {project.status}
            </span>
        </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-all">/{(project.slug || '')}</p>
    <div className="mt-2">
      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Commission: ₹{((project.templates?.commission_rate ?? 0.25) * (project.templates?.price ?? 0)).toFixed(2)}</p>
    </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
  <span>{project.templates?.template_category || ''}</span>
  <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : ''}</span>
      </div>
    </button>
  );
};
