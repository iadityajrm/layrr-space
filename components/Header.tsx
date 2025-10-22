import React from 'react';
import { MenuIcon, CloseIcon, SearchIcon, BellIcon, ChevronDownIcon } from './Icons';
type Profile = {
  name: string;
  email: string;
};

interface HeaderProps {
  user: Profile;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: any[];
  onSearchResultClick: (result: any) => void;
  onToggleNotificationPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, isSidebarOpen, searchQuery, onSearchChange, searchResults, onSearchResultClick, onToggleNotificationPanel }) => {
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
          {searchResults.length > 0 && (
            <div className="absolute mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {searchResults.map((result, index) => (
                  <a
                    key={index}
                    href="#"
                    onClick={() => onSearchResultClick(result)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                    role="menuitem"
                  >
                    {result.type === 'project' && `Project: ${result.data.title}`}
                    {result.type === 'template' && `Template: ${result.data.title}`}
                    {result.type === 'page' && `Go to: ${result.data.name}`}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={onToggleNotificationPanel} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200">
          <BellIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user.name}</p>
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
