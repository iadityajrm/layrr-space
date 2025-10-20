
import React from 'react';
import type { NavItem } from '../types';
import { DashboardIcon, FolderIcon, TemplateIcon, UserIcon, LogoutIcon, SunIcon, MoonIcon } from './Icons';

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  theme: string;
  toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, onLogout, isSidebarOpen, theme, toggleTheme }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { name: 'Projects', icon: <FolderIcon className="w-6 h-6" /> },
    { name: 'Templates', icon: <TemplateIcon className="w-6 h-6" /> },
    { name: 'Profile', icon: <UserIcon className="w-6 h-6" /> },
  ];

  const baseClasses = "flex items-center px-4 py-3 rounded-xl transition-colors duration-200";
  const activeClasses = "bg-primary-100 dark:bg-primary-600 text-primary-600 dark:text-white font-semibold";
  const inactiveClasses = "text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white";

  return (
    <aside className={`fixed inset-y-0 left-0 bg-slate-50 dark:bg-slate-900 w-64 space-y-6 py-7 px-2 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col border-r border-slate-200 dark:border-slate-800`}>
      <div className="px-4">
        {theme === 'dark' ? (
          <img src="/logo-light.svg" alt="Layrr Logo" className="h-8 object-contain" />
        ) : (
          <img src="/logo-dark.svg" alt="Layrr Logo" className="h-8 object-contain" />
        )}
      </div>

      <nav className="flex-grow">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`${baseClasses} w-full text-left ${activeItem === item.name ? activeClasses : inactiveClasses}`}
          >
            {item.icon}
            <span className="mx-4 font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-2 px-2">
           <div className="flex items-center justify-between">
             <button
               onClick={onLogout}
               className={`flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${inactiveClasses} flex-grow`}
             >
               <LogoutIcon className="w-6 h-6" />
               <span className="mx-4 font-medium">Logout</span>
             </button>
             <button
               onClick={toggleTheme}
               aria-label="Toggle theme"
               className={`p-3 rounded-xl ${inactiveClasses}`}
             >
               {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
             </button>
          </div>
        </div>
        <div className="mt-4 text-center px-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">v0.3 beta</p>
        </div>
      </div>
    </aside>
  );
};
