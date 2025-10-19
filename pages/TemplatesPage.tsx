import React, { useState } from 'react';
import type { Template } from '../types';
import { TemplateCard } from '../components/TemplateCard';
import { SearchIcon } from '../components/Icons';

interface TemplatesPageProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
}

const TemplateDetailView: React.FC<{ template: Template; onBack: () => void; onUseTemplate: (template: Template) => void }> = ({ template, onBack, onUseTemplate }) => {
    const commission = (template.price * 0.25).toFixed(2);
    
    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up">
            <button onClick={onBack} className="mb-8 text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">
                &larr; Back to Library
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <img src={template.imageUrl} alt={template.name} className="w-full h-64 object-cover" />
                <div className="p-8">
                    <div className="sm:flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{template.name}</h1>
                            <span className="mt-2 inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                {template.category}
                            </span>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                             <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{template.price.toFixed(2)}</p>
                             <p className="text-sm text-green-600 dark:text-green-400">You earn ₹{commission}</p>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-gray-600 dark:text-gray-300">{template.longDescription}</p>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Integrations</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {template.integrations.map(int => (
                                <span key={int} className="text-sm bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 px-3 py-1 rounded-full">{int}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => onUseTemplate(template)}
                            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Use Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const TemplatesPage: React.FC<TemplatesPageProps> = ({ templates, onUseTemplate }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  if (selectedTemplate) {
    return <TemplateDetailView template={selectedTemplate} onBack={() => setSelectedTemplate(null)} onUseTemplate={onUseTemplate} />;
  }
  
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Templates Library</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse ready-to-use designs built for speed and style.</p>
      </div>

      <div className="mb-8 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-0 focus:border-primary-500"
            />
          </div>
          <select className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-0 focus:border-primary-500">
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onSelect={() => setSelectedTemplate(template)} />
        ))}
      </div>
    </div>
  );
};