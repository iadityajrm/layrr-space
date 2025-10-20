
import React from 'react';
import type { NavItem } from '../types';
import { DashboardIcon, FolderIcon, TemplateIcon, UserIcon, LogoutIcon } from './Icons';

interface SidebarProps {
  activeItem: string;
  onNavigate: (item: string) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
}

const logoWhiteBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASIAAABCCAYAAAB5ylOhAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAdxSURBVHhe7Z1/aBxlHMe/8+62N4lJ29S0SQupbYy1SjHG2rRVMYqgVVAQ/6hFBMEPgggIioKgoAgKIlpERAVfFAV/LKiVUKxYtbVWbUu0tD9MS9qmSW2+3d17frA7adL23d2de857/h8Mz3d2dr7fz+TdzjvnPTMhSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSVK+JgY4mQAGmN3d3aGqqipWVlZkZ2f3T++lJCk/E0McTOsL2O7ubgwODv7pm5Qk5WticIBHAA4ODmJqamp9y5Wk/E4MEjC7urpiZGREcXFx/WpXkqT8TAwScHh4eHj96paUJCfCQAL09fVFbm5ufetWk5TkSAgS8MHBQezs7Kxr35IkJ8JAAtra2mJ2dta69i1JciQECHh+fl5zc3O961eTlEMhQMDFxUXNzs7qt35JchQECHh2dlaTk5N6168mKUeC2Bzg9fW1+vr69K5fTVKOBLHhAGdnp/r7+8f6L5GkPEgQG25vb+vv71/XfpaUNCRAbJiPj486Pz9f136WlDQkQGwYd3f3urYvSUpTINYMsLS0pG5ubuvaT5KSEkS6A3R2durc3Nxa9vWSkhJ0ugNMTEzozMzMWvb1ksqQQneA5ubmurS0tJb9vKQyhS7dAWZmZtTT07OW/bykMqXQDmB/f78aGxvXsp+XVKbQDqC+vl6NjY1r2c9LKtMI7QCdnZ1qa2vby35eUpkGlZ4BZmZmVFFRsaT9uKQyhSrda2lpiZqaGkvaj0sqU6gyQFVVFc3Nza1sPympTCGz/wBHjx4tISEBK1aswDvvvIPRo0fzyiuvsH//fho3bkx+fn45/IcklSls7gc4fPhwhISEsHjxYgYHBxkaGsLLL7+MIUOGkJGRQT8/P/zud79D//79OeyHJNUpZO4HePToUVRXV7N27VosXLiQzs5OTJgwAVdffTUDBgygo6MDRUVF/OIXv8DNN9+sZz8uqUwh8wA7OztZuHAhGzdu5K1/8sknrF+/npUrV6KoqCgn4pEkKQ/QO7u7u5mamrJ8+XIGBgbk5uby4IMP8vWvf52qqir+8z//k+nTp3sS3JIk5UGeB+ju7mbLli00NjbyrW99i+LiYqZNm8bo0aP56le/yssvv8zhvyRJdYo83AHOnTuXzMxMZGRk8I1v/DeuuOIKJk6cyAMPPID+/n5eeeUVlJWV8Z3vfIeBAwfK6V8kKXUK8gDnzp1LTEzMxIkTeeONN/jXf/0Xx48f58c//jHvete7mDhxIvv37+eNN97gq1/9KgkJCdxyyy20tbVxySWXyOl3JGlPIg9wf38/nZ2dLFiwgDNnziAzM5OPPfYZjhw5wtChQ/nu976Nrq4u9u/fT0BAALt375bTvyhJag8iA1RUVLBgwQI+//nPs3nz5m7z3r1709DQwKhRo3jiiSdw8803y9lfIkkbEOQBu7q6mDFjBmVlZZw8eZL+/n4aGxtJSkrgxRdfrGd/LklqFyI9gH379nHfffcxbdo0HnjgAezt7SEiIoLp06fL6nckSStCZAe4vr6elStX4pOf/CTz5s3j9ddfZ82aNTzwwAPMnz+fO+64g7Nnz/Lggw+SmZlZzj9HktQCRQbw3Llz/P3vf2fKlCm8++67/OM//iNnzpxBRUUF9913H//61/+ycOFCnnjiCR544AGOHj3Km2++yaFDh+T0e5K0J1GEAdjZ2cldd93Fixcv8o1vfINHHnmk27xs2TImTZrEc889x9KlS3niiScYOXIk/fr1k9P/SEnagSgC/H//938ZGBjgc5/7HPv37+fYsWNs3bqVuro6iouLuXDhAmVlZfzwhz/kpz/9qZz/hSTVCYoIcHZ2Nvfeey/r16/nmWee4b333uP999/n2LFj9O/fn+3bt/PLL7/kd7/7XX74wx8yYcIEOe2HJGkDogDwwQcf8MEHH9CnTx/27t3LV77yFc6ePcuNN95Ib28vx44d4+tf/zpbtmwhNTWVadOmyeleJGkFogBw8eJFvve979GvXz/OnTuXBx98kOeff57m5mZGjBjBuHHjePPNN9m1a5ec/kESagSiAODs7MxffvMZjz76KHv37qW7u5sZM2ZQU1PD4sWLmTp1Kt977z257YcktQpRBfjuu++466677GJJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJEmSJkiZ//A/eCqO0/Nl7gAAAAAElFTSuQmCC";

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onNavigate, onLogout, isSidebarOpen }) => {
  const navItems: NavItem[] = [
    { name: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" /> },
    { name: 'Projects', icon: <FolderIcon className="w-6 h-6" /> },
    { name: 'Templates', icon: <TemplateIcon className="w-6 h-6" /> },
    { name: 'Profile', icon: <UserIcon className="w-6 h-6" /> },
  ];

  const baseClasses = "flex items-center px-4 py-3 rounded-lg transition-colors duration-200";
  const activeClasses = "bg-primary-500 text-white shadow-lg";
  const inactiveClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <aside className={`fixed inset-y-0 left-0 bg-gray-800 text-white w-64 space-y-6 py-7 px-2 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col`}>
      <div className="px-4">
        <img 
            src={logoWhiteBase64} 
            alt="Layrr Logo" 
            className="h-8 object-contain"
        />
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

      <div>
        <button
            onClick={onLogout}
            className={`${baseClasses} w-full text-left ${inactiveClasses}`}
          >
            <LogoutIcon className="w-6 h-6" />
            <span className="mx-4 font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
