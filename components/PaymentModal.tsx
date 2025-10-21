import React from 'react';
import type { Template } from '../types';
import { CloseIcon } from './Icons';

interface PaymentModalProps {
  template: Template;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ template, onClose, onPaymentSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md transform transition-all animate-fade-in-up">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Template</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <CloseIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <img src={template.preview_url || ''} alt={template.title} className="w-20 h-20 rounded-lg object-cover" />
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">{template.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{template.category}</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Price</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">₹{(template.price ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">Commission ({((template.commission_rate ?? 0.25) * 100).toFixed(0)}%)</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">₹{((template.price ?? 0) * (template.commission_rate ?? 0.25)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
              <span className="text-slate-900 dark:text-white">You Earn</span>
              <span className="text-primary-600 dark:text-primary-400">₹{((template.price ?? 0) * (template.commission_rate ?? 0.25)).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button 
            onClick={onPaymentSuccess}
            className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-slate-800 transition-colors"
          >
            Simulate Payment & Create Project
          </button>
        </div>
      </div>
    </div>
  );
};
