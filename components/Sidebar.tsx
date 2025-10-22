import React from 'react';
import { DashboardIcon, FolderIcon, TemplatesIcon, ProfileIcon, LogoutIcon, SunIcon, MoonIcon, ChatIcon } from './Icons';

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  theme: string;
  toggleTheme: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: <DashboardIcon className="h-5 w-5" /> },
  { name: 'Projects', icon: <FolderIcon className="h-5 w-5" /> },
  { name: 'Templates', icon: <TemplatesIcon className="h-5 w-5" /> },
  { name: 'Profile', icon: <ProfileIcon className="h-5 w-5" /> },
  { name: 'Feedback', icon: <ChatIcon className="h-5 w-5" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, onLogout, isSidebarOpen, theme, toggleTheme }) => {
  return (
    <aside className={`absolute z-30 lg:relative lg:translate-x-0 w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-800">
        <img src={theme === 'dark' ? "/logo-white.svg" : "/logo-black.svg"} alt="Layrr Logo" className="h-8" />
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onNavigate(item.name)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${
              activeItem === item.name
                ? 'bg-primary-500 text-white shadow-lg'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button onClick={toggleTheme} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
          <span className="font-medium">Toggle Theme</span>
        </button>
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
          <LogoutIcon className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
