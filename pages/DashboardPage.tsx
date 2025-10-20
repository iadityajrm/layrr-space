
import React from 'react';
import { StatCard } from '../components/StatCard';
import type { StatCardData } from '../types';

interface DashboardPageProps {
  stats: StatCardData[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats }) => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome to your workspace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>
    </div>
  );
};