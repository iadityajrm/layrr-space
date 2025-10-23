import React, { useState, useEffect } from 'react';
import './src/loader.css';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { TemplateDetailPage } from './pages/TemplateDetailPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PaymentModal } from './components/PaymentModal';
import { NotificationPanel } from './components/NotificationPanel';
import Chatbot from './components/Chatbot.tsx';
import { supabase } from './src/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

import type { Profile, Assignment, Template, StatCardData } from './types';
import { DashboardIcon, FolderIcon, CheckSquareIcon } from './components/Icons';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Assignment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [selectedProject, setSelectedProject] = useState<Assignment | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const [templateToBuy, setTemplateToBuy] = useState<Template | null>(null);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredProjects = projects.filter(p => p.title?.toLowerCase().includes(lowerCaseQuery));
      const filteredTemplates = templates.filter(t => t.title?.toLowerCase().includes(lowerCaseQuery));
      
      const results: any[] = [
        ...filteredProjects.map(p => ({ type: 'project', data: p })),
        ...filteredTemplates.map(t => ({ type: 'template', data: t })),
      ];

      const pages = [
        'Templates', 'Payouts', 'Projects', 'Categories', 'Transactions',
        'Settings', 'Notifications', 'Activity Logs', 'Analytics',
        'Support Tickets', 'System Status', 'Integrations', 'Feedback'
      ];

      pages.forEach(page => {
        if (page.toLowerCase().includes(lowerCaseQuery)) {
          results.push({ type: 'page', data: { name: page } });
        }
      });

      if ('profile'.includes(lowerCaseQuery)) {
        results.push({ type: 'page', data: { name: 'Profile' } });
      }

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, projects, templates]);

  const handleSearchResultClick = (result: any) => {
    if (result.type === 'project') {
      setSelectedProject(result.data);
    } else if (result.type === 'template') {
      setSelectedTemplate(result.data);
    } else if (result.type === 'page') {
      setCurrentPage(result.data.name);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
      fetchAssignments();
      fetchTemplates();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;
    // user table uses user_id to store auth uid
    const uid = session.user.id;

    // Try lookup by `user_id` first (your schema uses this column), then fall back to `id`.
    let { data, error } = await supabase
      .from('users')
      .select('id, user_id, name, email, role, created_at, last_login, phone_number, upi_id, total_earnings')
      .eq('user_id', uid)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile by user_id:', error);
    }

    if (!data) {
      // Try the other column (some schemas store the auth uid in `id`)
      const res = await supabase
        .from('users')
        .select('id, user_id, name, email, role, created_at, last_login, phone_number, upi_id, total_earnings')
        .eq('id', uid)
        .maybeSingle();

      if (res.error) console.error('Error fetching profile by id:', res.error);
      data = res.data;
      error = res.error;
    }

    if (error) {
      // Unexpected DB error
      console.error('Error fetching profile:', error);
      return;
    }

    if (!data) {
      // No visible row returned. This can happen if the row exists but RLS/policies block access
      console.info('No profile row visible for auth uid', uid, '- check RLS policies and whether auth uid is stored in `id` or `user_id`.');
      setProfile(null);
      return;
    }

    console.info('Fetched profile row:', data);
    setProfile(data as any);
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        templates (
          id,
          category,
          preview_url,
          price,
          creator_id
        )
      `)
      .order('assigned_at', { ascending: false });
    if (error) console.error('Error fetching assignments:', error);
    else setProjects(data as any[]); // reuse projects state for assignments
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase.from('templates').select('*');
    if (error) console.error('Error fetching templates:', error);
    else setTemplates(data);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) setTheme(savedTheme);
    else if (prefersDark) setTheme('dark');
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProjects([]);
    setAuthPage('login');
  };
  
  const handlePaymentSuccess = async () => {
    if (!templateToBuy || !session?.user) return;

    const generateAssignmentId = () => {
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return (crypto as any).randomUUID();
      }
      // fallback
      return `a_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    };

    const newAssignment = {
      assignment_id: generateAssignmentId(),
      user_id: session.user.id,
      template_id: templateToBuy.id,
      assigned_at: new Date().toISOString(),
      status: 'Pending Verification',
    };

    const { data, error } = await supabase
      .from('assignments')
      .insert(newAssignment)
      .select(`
        *,
        templates (
          id,
          category,
          preview_url,
          price
        )
      `)
      .maybeSingle();

    if (error) {
      // Log full error object for diagnosis
      try {
        console.error('Error creating assignment (full):', JSON.stringify(error, null, 2));
      } catch (e) {
        console.error('Error creating assignment (object):', error);
      }
      console.error('Insert response data:', data);

      // Give the user a more actionable alert
      const details = error?.details || error?.message || 'Unknown error';
      alert(`Failed to create assignment: ${details}. Check RLS/policies and that the 'assignments' table exists and allows INSERT for this user.`);
      return;
    }

    // Success
    setProjects(prev => [data as any, ...prev]);
    setTemplateToBuy(null);
    setCurrentPage('Projects');
    setSelectedProject(data as any);
  };

  const normalizeStatus = (s?: string) => (s || '').toLowerCase();

  const stats: StatCardData[] = [
    { title: 'Total Earnings', value: `₹${(profile as any)?.total_earnings ? (profile as any).total_earnings.toFixed(2) : '0.00'}`, icon: <DashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Active Projects', value: projects.filter(p => {
      const st = normalizeStatus(p.status);
      return st === 'active' || st === 'pending verification' || st === 'pending_verification' || st === 'pending';
    }).length.toString(), icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Completed Sales', value: projects.filter(p => normalizeStatus(p.status) === 'completed').length.toString(), icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
  ];

  const renderPage = () => {
    if (selectedProject) {
      return <ProjectDetailPage project={selectedProject} user={profile!} onBack={() => setSelectedProject(null)} onProjectUpdate={(updatedProject) => {
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
      }} />;
    }
    if (selectedTemplate) {
      return <TemplateDetailPage 
        template={selectedTemplate} 
        onBack={() => setSelectedTemplate(null)}
        onUseTemplate={setTemplateToBuy}
      />;
    }
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardPage stats={stats} />;
      case 'Projects':
        return <ProjectsPage projects={projects} onSelectProject={setSelectedProject} />;
      case 'Templates':
        return <TemplatesPage templates={templates} onSelectTemplate={setSelectedTemplate} />;
      case 'Profile':
        return <ProfilePage user={profile!} setUser={setProfile} />;
      case 'Feedback':
        return <FeedbackPage />;
      // Add placeholders for other pages
      case 'Payouts':
      case 'Categories':
      case 'Transactions':
      case 'Settings':
      case 'Notifications':
      case 'Activity Logs':
      case 'Analytics':
      case 'Support Tickets':
      case 'System Status':
      case 'Integrations':
        return <div className="text-white">{`${currentPage} page is not implemented yet.`}</div>;
      default:
        return <DashboardPage stats={stats} />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">Loading...</div>;
  }

  if (!session) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {authPage === 'login' && <LoginPage onSwitchToSignup={() => setAuthPage('signup')} />}
            {authPage === 'signup' && <SignupPage onSwitchToLogin={() => setAuthPage('login')} />}
       </div>
    );
  }

  if (!profile) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Sidebar 
        activeItem={currentPage} 
        onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedProject(null);
            setSelectedTemplate(null);
            setSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={profile}
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={searchResults}
            onSearchResultClick={handleSearchResultClick}
            onToggleNotificationPanel={() => setNotificationPanelOpen(!isNotificationPanelOpen)}
        />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-950 p-6">
            {renderPage()}
          </main>
          <NotificationPanel isOpen={isNotificationPanelOpen} onClose={() => setNotificationPanelOpen(false)} />
        </div>
      </div>
      {templateToBuy && (
        <PaymentModal 
            template={templateToBuy}
            onClose={() => setTemplateToBuy(null)}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      <Chatbot user={profile} />
    </div>
  );
}

export default App;
