import React, { useState, useEffect } from 'react';
import type { Template } from '../types';

interface PaymentModalProps {
  template: Template;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ template, onClose, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000); // Simulate network delay
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onPaymentSuccess]);
  
  const commission = (template.price * 0.25).toFixed(2);

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        {!isSuccess ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Confirm Purchase</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">You are about to purchase a license for the "{template.name}" template.</p>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                <span>Template Price:</span>
                <span className="font-medium">${template.price.toFixed(2)}</span>
              </div>
               <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400">
                <span>Your Commission (25%):</span>
                <span className="font-medium">+ ${commission}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-primary-400 flex items-center"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Pay Now'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                 <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Payment Successful!</h3>
             <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your new project is being created...</p>
          </div>
        )}
      </div>
    </div>
  );
};
