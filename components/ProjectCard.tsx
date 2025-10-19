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
  Archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
  return (
    <button onClick={onSelect} className="w-full text-left bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-transparent hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 dark:text-white pr-2">{project.name}</h3>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap ${statusStyles[project.status]}`}>
                {project.status}
            </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">/{project.slug}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
        <span>{project.templateType}</span>
        <span>{project.createdDate}</span>
      </div>
    </button>
  );
};