import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PaymentModal } from './components/PaymentModal';
import { supabase } from './src/lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

import type { Profile, Project, Template, StatCardData } from './types';
import { DashboardIcon, FolderIcon, CheckSquareIcon } from './components/Icons';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [templateToBuy, setTemplateToBuy] = useState<Template | null>(null);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');

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
      fetchProjects();
      fetchTemplates();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (error) console.error('Error fetching profile:', error);
    else setProfile(data);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        templates (
          template_name,
          price,
          commission_rate,
          preview_image_url
        )
      `)
      .order('created_at', { ascending: false });
    if (error) console.error('Error fetching projects:', error);
    else setProjects(data as Project[]);
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

    const newProject = {
      user_id: session.user.id,
      template_id: templateToBuy.id,
      project_name: `New ${templateToBuy.template_name} Project`,
      slug: `new-${templateToBuy.slug}-${Date.now()}`,
      status: 'Pending Verification',
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(newProject)
      .select(`
        *,
        templates (
          template_name,
          price,
          commission_rate,
          preview_image_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project.');
    } else {
      setProjects(prev => [data as Project, ...prev]);
      setTemplateToBuy(null);
      setCurrentPage('Projects');
      setSelectedProject(data as Project);
    }
  };

  const stats: StatCardData[] = [
    { title: 'Total Earnings', value: `₹${profile?.total_earnings?.toFixed(2) ?? '0.00'}`, icon: <DashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Active Projects', value: projects.filter(p => p.status === 'active' || p.status === 'pending_verification').length.toString(), icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Completed Sales', value: projects.filter(p => p.status === 'completed').length.toString(), icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
  ];

  const renderPage = () => {
    if (selectedProject) {
      return <ProjectDetailPage project={selectedProject} user={profile!} onBack={() => setSelectedProject(null)} onProjectUpdate={(updatedProject) => {
        setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
      }} />;
    }
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardPage stats={stats} />;
      case 'Projects':
        return <ProjectsPage projects={projects} onSelectProject={setSelectedProject} />;
      case 'Templates':
        return <TemplatesPage templates={templates} onUseTemplate={setTemplateToBuy} />;
      case 'Profile':
        return <ProfilePage user={profile!} setUser={setProfile} />;
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
     return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">Fetching profile...</div>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Sidebar 
        activeItem={currentPage} 
        onNavigate={(page) => {
            setCurrentPage(page);
            setSelectedProject(null);
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
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-slate-950 p-6">
          {renderPage()}
        </main>
      </div>
      {templateToBuy && (
        <PaymentModal 
            template={templateToBuy}
            onClose={() => setTemplateToBuy(null)}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default App;
