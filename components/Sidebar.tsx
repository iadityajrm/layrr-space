
import React, { useState } from 'react';
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
        {/* Render both images and let Tailwind's dark: utilities handle visibility. */}
        {/* Track failures so we can show a clear inline SVG fallback if the PNGs are corrupted. */}
        {/* Using local state avoids flashing and keeps behavior predictable. */}
        {
          (() => {
            const [blackError, setBlackError] = useState(false);
            const [whiteError, setWhiteError] = useState(false);

            const blackImg = (
              <img
                src="/logo-black.svg"
                alt="Layrr Logo - black"
                className="h-8 object-contain block dark:hidden"
                style={{ display: blackError ? 'none' : undefined }}
                onError={(e) => {
                  console.warn('Failed to load logo-black.svg, falling back to PNG:', e.currentTarget.src);
                  // try png fallback
                  (e.currentTarget as HTMLImageElement).src = '/logo-black.png';
                }}
              />
            );

            const whiteImg = (
              <img
                src="/logo-white.svg"
                alt="Layrr Logo - white"
                className="h-8 object-contain hidden dark:block"
                style={{ display: whiteError ? 'none' : undefined }}
                onError={(e) => {
                  console.warn('Failed to load logo-white.svg, falling back to PNG:', e.currentTarget.src);
                  (e.currentTarget as HTMLImageElement).src = '/logo-white.png';
                }}
              />
            );

            const fallbackLogo = (
              <div className="h-8 flex items-center text-lg font-bold text-slate-800 dark:text-white">
                {/* Simple inline SVG/text fallback so the sidebar always has a visible brand */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <rect width="24" height="24" rx="4" fill="#3b82f6" />
                  <text x="12" y="16" textAnchor="middle" fontSize="12" fontFamily="Arial" fill="white">L</text>
                </svg>
                <span className="hidden sm:inline">Layrr</span>
              </div>
            );

            // If theme is dark but white image failed -> show fallback
            if (theme === 'dark') {
              return whiteError ? fallbackLogo : (
                <>
                  {whiteImg}
                  {blackImg}
                </>
              );
            }

            // light theme
            return blackError ? fallbackLogo : (
              <>
                {blackImg}
                {whiteImg}
              </>
            );
          })()
        }
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
