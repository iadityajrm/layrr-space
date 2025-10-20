import React from 'react';
import { MenuIcon, CloseIcon, SearchIcon, BellIcon, ChevronDownIcon } from './Icons';
import type { Profile } from '../types';

interface HeaderProps {
  user: Profile;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, isSidebarOpen, searchQuery, onSearchChange }) => {
  return (
    <header className="flex-shrink-0 h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center">
        <button onClick={onToggleSidebar} className="lg:hidden mr-4 text-slate-600 dark:text-slate-300">
          {isSidebarOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-primary-500 transition"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
          <BellIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
            {user.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.full_name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
          <button className="hidden md:block p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ChevronDownIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
