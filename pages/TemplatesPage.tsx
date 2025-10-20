
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={template.imageUrl} alt={template.name} className="w-full h-64 object-cover" />
                <div className="p-8">
                    <div className="sm:flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{template.name}</h1>
                            <span className="mt-2 inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                                {template.category}
                            </span>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right">
                             <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{template.price.toFixed(2)}</p>
                             <p className="text-sm text-green-600 dark:text-green-400">You earn ₹{commission}</p>
                        </div>
                    </div>
                    
                    <p className="mt-4 text-slate-600 dark:text-slate-300">{template.longDescription}</p>
                    
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Integrations</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {template.integrations.map(int => (
                                <span key={int} className="text-sm bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 px-3 py-1 rounded-full">{int}</span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            onClick={() => onUseTemplate(template)}
                            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-200"
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (selectedTemplate) {
    return <TemplateDetailView template={selectedTemplate} onBack={() => setSelectedTemplate(null)} onUseTemplate={onUseTemplate} />;
  }
  
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    const lowerCaseQuery = searchQuery.toLowerCase();
    const matchesSearch = template.name.toLowerCase().includes(lowerCaseQuery) ||
                          template.description.toLowerCase().includes(lowerCaseQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Templates Library</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Browse ready-to-use designs built for speed and style.</p>
      </div>

      <div className="mb-8 p-4 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search templates by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:ring-0 focus:border-primary-500"
            />
          </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(cat => (
            <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    activeCategory === cat 
                    ? 'bg-primary-600 text-white shadow' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} onSelect={() => setSelectedTemplate(template)} />
        ))}
      </div>
    </div>
  );
};
