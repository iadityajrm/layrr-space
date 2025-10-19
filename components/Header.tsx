
import React from 'react';
import { MenuIcon } from './Icons';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow-sm lg:hidden">
      <button
        type="button"
        className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex items-center">
           <h1 className="text-lg font-bold text-gray-900 dark:text-white">Layrr Dashboard</h1>
        </div>
      </div>
    </header>
  );
};
