
import React from 'react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 flex items-center space-x-4">
      <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};
