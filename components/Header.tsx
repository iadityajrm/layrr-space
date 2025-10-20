
import React from 'react';
import type { User } from '../types';
import { MenuIcon, XIcon, SearchIcon } from './Icons';

interface HeaderProps {
  user: User | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
    const initials = `${user.firstName[0]}${user.lastName[0]}`;
    return (
      <div className="w-10 h-10 rounded-full bg-primary-500/20 dark:bg-primary-500/30 text-primary-700 dark:text-primary-200 flex items-center justify-center font-bold text-sm ml-4 border-2 border-primary-200 dark:border-primary-500">
        {initials}
      </div>
    );
};

export const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, isSidebarOpen, searchQuery, onSearchChange }) => {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden mr-2 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
            >
              <span className="sr-only">Open sidebar</span>
              {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
            <div className="relative hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                    type="text" 
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
            </div>
          </div>
          <div className="flex items-center">
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <UserAvatar user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
