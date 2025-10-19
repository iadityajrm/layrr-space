import React from 'react';
import type { NavItem } from '../types';
import { SunIcon, MoonIcon, LogoutIcon } from './Icons';

interface SidebarProps {
  navItems: NavItem[];
  activeItem: string;
  setActiveItem: (item: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
}

// Base64 encoded logos to prevent path issues
const logoWhiteBase64 = "data:image/png;base64,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";
const logoBlackBase64 = "data:image/png;base64,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";

export const Sidebar: React.FC<SidebarProps> = ({ 
    navItems, activeItem, setActiveItem, isDarkMode, toggleDarkMode, onLogout
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="p-4 flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
            <img 
              src={isDarkMode ? logoWhiteBase64 : logoBlackBase64} 
              alt="Layrr Logo" 
              className="h-8 object-contain"
            />
        </div>
        <nav className="flex-1 mt-6 px-2 space-y-2">
            {navItems.map((item) => (
                <a
                    key={item.name}
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        setActiveItem(item.name);
                    }}
                    className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        activeItem === item.name
                            ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300'
                            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                </a>
            ))}
        </nav>
        <div className="p-2 mt-auto border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-end gap-2">
                <button 
                    onClick={toggleDarkMode}
                    className="flex-shrink-0 flex items-center justify-center p-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                </button>
                <button 
                    onClick={onLogout}
                    className="flex-shrink-0 flex items-center justify-center p-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors duration-200"
                     aria-label="Logout"
                >
                    <LogoutIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex flex-shrink-0 w-64 flex-col fixed inset-y-0">
      <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {sidebarContent}
      </div>
    </div>
  );
};