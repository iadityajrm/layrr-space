import React from 'react';
import type { Project } from '../types';
import { ProjectCard } from '../components/ProjectCard';

interface ProjectsPageProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All your active templates and brand pages in one place.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={() => onSelectProject(project)} />
        ))}
      </div>
    </div>
  );
};