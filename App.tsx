import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavItem, StatCardData, Project, Template, User } from './types';
import { TemplateIcon, CheckSquareIcon, BarChartIcon, SettingsIcon, BriefcaseIcon, UserIcon, DollarSignIcon } from './components/Icons';

import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { PaymentModal } from './components/PaymentModal';

const App: React.FC = () => {
  const [activeNavItem, setActiveNavItem] = useState<string>('Dashboard');
  const [isDarkMode, setDarkMode] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const [user, setUser] = useState<User>({
    firstName: 'Alex',
    lastName: 'Doe',
    city: 'San Francisco',
    email: 'alex.doe@layrr.space',
    mobile: '555-123-4567',
    upiId: 'alex.doe@bank',
    totalEarnings: 249.75,
  });

  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Zoca Cafe Reviews', slug: 'zoca-cafe', templateType: 'Review Page', createdDate: '2023-10-26', status: 'Completed', brandName: 'Zoca Cafe', proofImageUrl: 'https://placehold.co/400x300/3b82f6/ffffff?text=Proof+Image' },
    { id: '2', name: 'Quantum Leap Landing', slug: 'quantum-launch', templateType: 'Landing Page', createdDate: '2023-10-22', status: 'Active', brandName: 'Quantum Leap', proofImageUrl: null },
    { id: '3', name: 'My Portfolio V2', slug: 'portfolio-v2', templateType: 'Portfolio', createdDate: '2023-09-15', status: 'Pending Verification', brandName: 'Alex Doe Portfolio', proofImageUrl: 'https://placehold.co/400x300/f59e0b/ffffff?text=Pending+Proof' },
    { id: '4', name: 'Archived Campaign', slug: 'old-campaign', templateType: 'Landing Page', createdDate: '2023-01-05', status: 'Archived', brandName: 'Old Campaign Co.', proofImageUrl: null },
    { id: '5', name: 'Nebula SaaS', slug: 'nebula-saas', templateType: 'Landing Page', createdDate: '2023-11-01', status: 'Active', brandName: 'Nebula', proofImageUrl: null },
    { id: '6', name: 'E-commerce Redesign', slug: 'ecom-v2', templateType: 'Storefront', createdDate: '2023-08-19', status: 'Active', brandName: 'E-com Store', proofImageUrl: null },
  ]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <BarChartIcon className="w-5 h-5" /> },
    { name: 'Projects', icon: <BriefcaseIcon className="w-5 h-5" /> },
    { name: 'Templates', icon: <TemplateIcon className="w-5 h-5" /> },
    { name: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
    { name: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
  ];

  const stats: StatCardData[] = [
    { title: 'Active Projects', value: projects.filter(p => p.status === 'Active').length.toString(), icon: <BriefcaseIcon className="w-8 h-8 text-primary-500" /> },
    { title: 'Pending Verification', value: projects.filter(p => p.status === 'Pending Verification').length.toString(), icon: <CheckSquareIcon className="w-8 h-8 text-primary-500" /> },
    { title: 'Total Earnings', value: `$${user.totalEarnings.toFixed(2)}`, icon: <DollarSignIcon className="w-8 h-8 text-primary-500" /> },
  ];

  const templates: Template[] = [
    { id: 't1', name: 'Review Collector', category: 'Marketing', description: 'A clean page to collect and display customer reviews.', longDescription: 'This template provides a streamlined, user-friendly interface for customers to submit reviews and for you to display them beautifully. It includes features like star ratings, photo uploads, and social sharing to maximize engagement.', imageUrl: 'https://placehold.co/600x400/3b82f6/ffffff?text=Review+Template', integrations: ['Google Reviews', 'Yelp'], price: 99 },
    { id: 't2', name: 'SaaS Landing Page', category: 'Startup', description: 'High-converting landing page for your new product.', longDescription: 'Launch your next big idea with this high-converting landing page. It features clear call-to-actions, a pricing section, feature highlights, and testimonials, all designed to turn visitors into customers.', imageUrl: 'https://placehold.co/600x400/10b981/ffffff?text=SaaS+Template', integrations: ['Stripe', 'Mailchimp'], price: 149 },
    { id: 't3', name: 'Personal Portfolio', category: 'Creative', description: 'Showcase your work with this elegant portfolio.', longDescription: 'A minimalist and elegant portfolio template perfect for designers, developers, and photographers. The grid-based layout and smooth animations let your work speak for itself.', imageUrl: 'https://placehold.co/600x400/8b5cf6/ffffff?text=Portfolio', integrations: ['Framer', 'Dribbble'], price: 79 },
    { id: 't4', name: 'Agency Homepage', category: 'Business', description: 'Professional homepage for creative agencies.', longDescription: 'Put your agency\'s best foot forward with this professional and modern homepage. Highlight your services, showcase your team, and feature your best projects in a compelling narrative.', imageUrl: 'https://placehold.co/600x400/f59e0b/ffffff?text=Agency+Template', integrations: ['HubSpot', 'Salesforce'], price: 199 },
  ];

  const handleStartPayment = (template: Template) => {
    setSelectedTemplate(template);
    setShowPaymentModal(true);
  };
  
  const handlePaymentSuccess = () => {
      if (!selectedTemplate) return;

      const newProject: Project = {
        id: `p${projects.length + 1}`,
        name: `${selectedTemplate.name} Project`,
        slug: `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        templateType: selectedTemplate.name,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        brandName: 'Your New Brand',
        proofImageUrl: null,
      };

      setProjects(prev => [newProject, ...prev]);
      setShowPaymentModal(false);
      setSelectedTemplate(null);
      setActiveNavItem('Projects');
      setViewingProject(newProject);
  };
  
  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  const renderContent = () => {
    if (viewingProject) {
        return <ProjectDetailPage 
            project={viewingProject} 
            onUpdateProject={handleUpdateProject}
            onBack={() => setViewingProject(null)} 
        />;
    }

    switch(activeNavItem) {
      case 'Projects':
        return <ProjectsPage projects={projects} onSelectProject={setViewingProject} />;
      case 'Templates':
        return <TemplatesPage templates={templates} onUseTemplate={handleStartPayment} />;
      case 'Profile':
        return <ProfilePage user={user} setUser={setUser} />;
      case 'Dashboard':
      default:
        return <DashboardPage stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar 
        navItems={navItems}
        activeItem={activeNavItem}
        setActiveItem={(item) => {
            setViewingProject(null);
            setActiveNavItem(item);
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <div className="flex-1 flex flex-col ml-64 overflow-y-auto">
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
        <footer className="text-center p-4 text-sm text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 mt-auto">
            Built with Layrr
        </footer>
      </div>
      {showPaymentModal && selectedTemplate && (
        <PaymentModal 
            template={selectedTemplate}
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default App;