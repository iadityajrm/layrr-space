import React from 'react';
import { StatCard } from '../components/StatCard';
import type { StatCardData } from '../types';

interface DashboardPageProps {
  stats: StatCardData[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats }) => {
  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>
      {/* You can add more dashboard components here, e.g., charts, recent activity */}
    </div>
  );
};
