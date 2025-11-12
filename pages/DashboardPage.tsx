import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { supabase } from '../src/lib/supabaseClient';
import { DashboardIcon, FolderIcon, CheckSquareIcon } from '../components/Icons';
import type { StatCardData } from '../types';

interface DashboardPageProps {
  stats?: StatCardData[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats }) => {
  const [metrics, setMetrics] = useState<StatCardData[]>(stats || []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current session/user
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id || null;

        // Fetch earnings from users table
        let earningsValue = '₹0.00';
        if (userId) {
          const { data: profileRow, error: profileErr } = await supabase
            .from('users')
            .select('total_earnings')
            .eq('id', userId)
            .maybeSingle();
          if (profileErr) throw profileErr;
          if (profileRow?.total_earnings != null) {
            const num = Number(profileRow.total_earnings);
            earningsValue = `₹${num.toFixed(2)}`;
          }
        }

        // Counts for projects (RLS ensures only the current user's data is visible)
        const { count: totalCount, error: totalErr } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });
        if (totalErr) throw totalErr;

        const openStatuses = ['active', 'pending', 'pending_verification', 'pending verification'];
        const { count: openCount, error: openErr } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .in('status', openStatuses);
        if (openErr) throw openErr;

        const { count: completedCount, error: completedErr } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        if (completedErr) throw completedErr;

        const { count: pendingVerifCount, error: pendingErr } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pending_verification', 'pending verification']);
        if (pendingErr) throw pendingErr;

        const newMetrics: StatCardData[] = [
          { title: 'Total Earnings', value: earningsValue, icon: <DashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
          { title: 'Projects Open', value: String(openCount || 0), icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
          { title: 'Completed Projects', value: String(completedCount || 0), icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
          { title: 'Pending Verification', value: String(pendingVerifCount || 0), icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
          { title: 'Total Projects', value: String(totalCount || 0), icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
        ];

        setMetrics(newMetrics);
      } catch (e: any) {
        console.error('Dashboard metrics error:', e);
        setError(e?.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const placeholderMetrics: StatCardData[] = [
    { title: 'Total Earnings', value: 'Loading...', icon: <DashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Projects Open', value: 'Loading...', icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Completed Projects', value: 'Loading...', icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
  ];

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>
      {error && (
        <div className="rounded-lg border border-red-400 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 p-4 mb-4">
          <p className="font-semibold">Failed to load metrics</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(loading && metrics.length === 0 ? placeholderMetrics : metrics).map((stat, index) => (
          <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
        ))}
      </div>
      {/* Add more dashboard components here, e.g., charts, recent activity */}
    </div>
  );
};
