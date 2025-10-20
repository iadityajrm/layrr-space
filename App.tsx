
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

import type { User, Project, Template, StatCardData } from './types';
import { DashboardIcon, FolderIcon, CheckSquareIcon } from './components/Icons';

// Mock Data
const mockUser: User = {
    firstName: 'Alex',
    lastName: 'Doe',
    city: 'San Francisco',
    email: 'alex.doe@layrr.space',
    mobile: '555-123-4567',
    upiId: 'alex.doe@bank',
    totalEarnings: 249.75,
};

const mockProjects: Project[] = [
    { id: 'proj1', name: 'Sanjay\'s Cafe Page', slug: 'sanjays-cafe', templateType: 'Cafe Landing Page', createdDate: '2023-10-26', status: 'Active', brandName: 'Sanjay\'s Cafe', proofImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', price: 999, commission: 249.75 },
    { id: 'proj2', name: 'Gupta\'s Electronics', slug: 'gupta-electronics', templateType: 'Retail Storefront', createdDate: '2023-10-22', status: 'Pending Verification', brandName: 'Gupta\'s Electronics', proofImageUrl: null, price: 1499, commission: 374.75 },
    { id: 'proj3', name: 'The Yoga House', slug: 'the-yoga-house', templateType: 'Fitness Studio', createdDate: '2023-09-15', status: 'Completed', brandName: 'The Yoga House', proofImageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2120&q=80', price: 1999, commission: 499.75 },
    { id: 'proj4', name: 'Archived Project', slug: 'archived-project', templateType: 'Generic Template', createdDate: '2023-01-01', status: 'Archived', brandName: 'Old Business', proofImageUrl: null, price: 500, commission: 125.00 },
];

const mockTemplates: Template[] = [
    { id: 'temp1', name: 'Cafe Landing Page', category: 'Food & Beverage', description: 'A modern, single-page site for cafes and restaurants.', longDescription: 'Engage your customers with a beautiful, mobile-friendly landing page. Showcase your menu, photos, location, and contact information. Perfect for cafes, bakeries, and small restaurants looking for a strong online presence.', imageUrl: 'https://images.unsplash.com/photo-1511920183353-3c9c9b02ce7c?auto=format&fit=crop&w=800&q=60', integrations: ['Google Maps', 'Social Media'], price: 999 },
    { id: 'temp2', name: 'Retail Storefront', category: 'E-commerce', description: 'A clean and simple storefront for local shops.', longDescription: 'Launch your online store quickly with this easy-to-use template. It includes a product gallery, item details, and a clear call-to-action. Ideal for boutiques, electronics shops, and local artisans.', imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=60', integrations: ['UPI Payments', 'WhatsApp'], price: 1499 },
    { id: 'temp3', name: 'Fitness Studio', category: 'Health & Wellness', description: 'Promote classes and schedules for gyms or studios.', longDescription: 'Attract new members with a dynamic website. This template features sections for class schedules, trainer profiles, testimonials, and membership pricing. Great for yoga studios, gyms, and personal trainers.', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=60', integrations: ['Booking Calendar', 'Instagram Feed'], price: 1999 },
    { id: 'temp4', name: 'Portfolio for Creatives', category: 'Services', description: 'A stylish portfolio for photographers and designers.', longDescription: 'Showcase your best work with this visually-focused portfolio template. It features a stunning gallery, an "about me" section, and a contact form to help you land your next client. Optimized for high-resolution images.', imageUrl: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=800&q=60', integrations: ['Contact Form', 'Social Media'], price: 1299 },
];

const mockStats: StatCardData[] = [
    { title: 'Total Earnings', value: `₹${mockUser.totalEarnings.toFixed(2)}`, icon: <DashboardIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Active Projects', value: mockProjects.filter(p => p.status === 'Active' || p.status === 'Pending Verification').length.toString(), icon: <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
    { title: 'Completed Sales', value: mockProjects.filter(p => p.status === 'Completed').length.toString(), icon: <CheckSquareIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" /> },
];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<'login' | 'signup'>('login');
  
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [templateToBuy, setTemplateToBuy] = useState<Template | null>(null);
  const [theme, setTheme] = useState('light');
  const [searchQuery, setSearchQuery] = useState('');


  // Effect to initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  // Effect to apply theme class and save to localStorage
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

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };
  
  const handleSignupSuccess = () => {
    // After onboarding is complete, switch to the main app (dashboard)
    // The user state is already set in the SignupPage component
    setCurrentPage('Dashboard');
  };
  
  const handleLogout = () => {
      setUser(null);
      setAuthPage('login');
  };
  
  const handlePaymentSuccess = () => {
    if (!templateToBuy) return;

    const newProject: Project = {
      id: `proj${projects.length + 1}`,
      name: `New ${templateToBuy.name} Project`,
      slug: `new-${templateToBuy.name.toLowerCase().replace(/ /g, '-')}`,
      templateType: templateToBuy.name,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Pending Verification',
      brandName: 'New Brand',
      proofImageUrl: null,
      price: templateToBuy.price,
      commission: templateToBuy.price * 0.25,
    };

    setProjects(prev => [newProject, ...prev]);
    setTemplateToBuy(null);
    setCurrentPage('Projects'); // Navigate to projects page
    setSelectedProject(newProject); // Go directly to the new project detail
  };


  const renderPage = () => {
    if (selectedProject) {
      return <ProjectDetailPage project={selectedProject} user={user!} onBack={() => setSelectedProject(null)} />;
    }
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardPage stats={mockStats} />;
      case 'Projects':
        return <ProjectsPage projects={projects} onSelectProject={setSelectedProject} />;
      case 'Templates':
        return <TemplatesPage templates={mockTemplates} onUseTemplate={setTemplateToBuy} />;
      case 'Profile':
        return <ProfilePage user={user!} setUser={setUser} />;
      default:
        return <DashboardPage stats={mockStats} />;
    }
  };

  if (!user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
            {authPage === 'login' && <LoginPage onLoginSuccess={handleLoginSuccess} onSwitchToSignup={() => setAuthPage('signup')} />}
            {authPage === 'signup' && <SignupPage onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setAuthPage('login')} setUser={setUser} />}
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
            setSidebarOpen(false);
        }}
        onLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            user={user}
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
