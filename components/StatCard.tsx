import React from 'react';
import type { StatCardData } from '../types';

export const StatCard: React.FC<StatCardData> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className="bg-primary-100 dark:bg-slate-800 p-3 rounded-full">
        {icon}
      </div>
    </div>
  );
};
