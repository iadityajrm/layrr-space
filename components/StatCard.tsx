
import React from 'react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-md p-6 flex items-center space-x-4 border border-slate-200 dark:border-slate-800">
      <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};
