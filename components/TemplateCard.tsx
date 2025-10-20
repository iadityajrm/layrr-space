import React from 'react';
import type { Template } from '../types';

interface TemplateCardProps {
  template: Template;
  onSelect: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const commission = (template.price * 0.25).toFixed(2);

  return (
    <button 
      onClick={onSelect} 
      className="group w-full text-left bg-white dark:bg-slate-800/50 rounded-2xl shadow-md overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="aspect-w-16 aspect-h-9">
        <img src={template.imageUrl} alt={template.name} className="w-full h-40 object-cover" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
            <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium mb-2 px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
              {template.category}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white truncate">{template.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 h-10">{template.description}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-baseline">
            <p className="text-lg font-bold text-slate-800 dark:text-white">₹{template.price.toFixed(2)}</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Earn ₹{commission}</p>
        </div>
      </div>
    </button>
  );
};
