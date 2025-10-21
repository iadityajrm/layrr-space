import React from 'react';
import type { Template } from '../types';

interface TemplatesPageProps {
  templates: Template[];
  onSelectTemplate: (template: Template) => void;
}

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ templates, onSelectTemplate }) => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Template Library</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <button 
            key={template.id} 
            onClick={() => onSelectTemplate(template)}
            className="text-left bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <div className="relative">
              <img src={template.preview_url || ''} alt={template.title} className="h-48 w-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
              <div className="absolute top-3 right-3 bg-primary-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                ₹{(template.price ?? 0).toFixed(2)}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{template.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.category}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 flex-1">{template.description}</p>
              <div className="mt-4 text-right">
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">
                  View Details &rarr;
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
