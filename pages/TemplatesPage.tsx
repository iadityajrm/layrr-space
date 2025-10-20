import React from 'react';
import type { Template } from '../types';

interface TemplatesPageProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ templates, onUseTemplate }) => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Template Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group">
            <div className="relative">
              <img src={template.preview_image_url} alt={template.template_name} className="h-48 w-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{template.template_name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.category}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 flex-1">{template.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-primary-600 dark:text-primary-400">₹{template.price.toFixed(2)}</span>
                <button 
                  onClick={() => onUseTemplate(template)}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
