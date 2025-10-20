
import React from 'react';
import type { User } from '../types';
import { MenuIcon, XIcon } from './Icons';

interface HeaderProps {
  user: User | null;
  pageTitle: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ user, pageTitle, onToggleSidebar, isSidebarOpen }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <span className="sr-only">Open sidebar</span>
              {isSidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{pageTitle}</h1>
          </div>
          <div className="flex items-center">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
