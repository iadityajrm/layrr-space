import React from 'react';
import { CloseIcon } from './Icons';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notifications</h2>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4">
        <p className="text-slate-500 dark:text-slate-400">No new notifications.</p>
      </div>
    </div>
  );
};
