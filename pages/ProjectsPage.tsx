import React from 'react';
import type { Project } from '../types';
import { ProjectCard } from '../components/ProjectCard';
import { PlusIcon } from '../components/Icons';

interface ProjectsPageProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All your active templates and brand pages in one place.</p>
        </div>
        <button className="flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors duration-200">
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
        ))}
      </div>
    </div>
  );
};