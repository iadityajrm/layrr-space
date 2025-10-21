import React from 'react';
import type { Template } from '../types';
import { ArrowLeftIcon, ExternalLinkIcon, ShoppingCartIcon, InfoIcon, CheckCircleIcon, LightBulbIcon } from '../components/Icons';

interface TemplateDetailPageProps {
  template: Template;
  onBack: () => void;
  onUseTemplate: (template: Template) => void;
}

const DetailSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
    </div>
    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400">
      {children || <p>No information provided.</p>}
    </div>
  </div>
);

export const TemplateDetailPage: React.FC<TemplateDetailPageProps> = ({ template, onBack, onUseTemplate }) => {
  const commission = ((template.price ?? 0) * (template.commission_rate ?? 0.25)).toFixed(2);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Templates
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row gap-6">
              <img 
                src={template.preview_url || ''} 
                alt={template.title} 
                className="w-full md:w-48 h-48 object-cover rounded-xl" 
              />
              <div className="flex-1">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium mb-2 px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                  {template.category}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{template.title}</h1>
                <p className="text-slate-600 dark:text-slate-400">{template.description || 'No description available.'}</p>
              </div>
            </div>
          </div>

          <DetailSection title="Instructions" icon={<InfoIcon className="w-5 h-5" />}>
            <p>{template.instructions}</p>
          </DetailSection>

          <DetailSection title="Use Cases" icon={<CheckCircleIcon className="w-5 h-5" />}>
            <p>{template.use_cases}</p>
          </DetailSection>

          <DetailSection title="Marketing Tips" icon={<LightBulbIcon className="w-5 h-5" />}>
            <p>{template.marketing_info}</p>
          </DetailSection>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-white dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">₹{(template.price ?? 0).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Potential Commission</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">Earn ₹{commission}</p>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => onUseTemplate(template)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white text-base font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Use Template
              </button>
              {template.template_url && (
                <a 
                  href={template.template_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 text-base font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
                >
                  <ExternalLinkIcon className="w-5 h-5" />
                  View Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
