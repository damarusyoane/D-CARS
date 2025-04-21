import  { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: typeof HomeIcon;
  requiresAuth: boolean;
}

const navigation: NavItem[] = [
  { name: 'Home', path: '/', icon: HomeIcon, requiresAuth: false },
  { name: 'Browse Cars', path: '/cars', icon: TruckIcon, requiresAuth: false },
  { name: 'Search', path: '/search', icon: MagnifyingGlassIcon, requiresAuth: false },
  { name: 'Messages', path: '/dashboard/messages', icon: ChatBubbleLeftRightIcon, requiresAuth: true },
  { name: 'Profile', path: '/dashboard/profile', icon: UserCircleIcon, requiresAuth: true },
  { name: 'Saved Cars', path: '/dashboard/saved', icon: HeartIcon, requiresAuth: true },
  { name: 'My Listings', path: '/dashboard/my-listings', icon: ClipboardDocumentListIcon, requiresAuth: true },
  { name: 'Transactions', path: '/dashboard/transactions', icon: CurrencyDollarIcon, requiresAuth: true },
  { name: 'Settings', path: '/dashboard/settings', icon: Cog6ToothIcon, requiresAuth: true },
];

export default function MainLayout({ children }: MainLayoutProps) {
  const { isAuthenticated, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-4">
            <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              D-CARS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
              {navigation.map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <SunIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <MoonIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {isAuthenticated && (
                <button
                  onClick={signOut}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
} 