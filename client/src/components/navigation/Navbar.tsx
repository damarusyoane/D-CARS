import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {
  UserCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarSquareIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ReceiptRefundIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Combined Navbar component that handles both authenticated and non-authenticated states
 * Guarantees that login/signup buttons are always visible when not authenticated
 */
function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { signOut } = useAuth();
  
  // Use local state to track login status for more reliable rendering
  useEffect(() => {
    // Check if user is logged in
    console.log('Auth state updated:', { 
      user: auth.user, 
      isLoading: auth.isLoading 
    });
    
    setIsLoggedIn(!!auth.user);
  }, [auth.user, auth.isLoading]);

  // Robust logout handler (copied from AdminDashboard/AuthenticatedNavbar)
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      [localStorage, sessionStorage].forEach(storage => {
        Object.keys(storage)
          .filter((key) => key.startsWith('sb-'))
          .forEach((key) => storage.removeItem(key));
      });
      if ('indexedDB' in window) {
        try { window.indexedDB.deleteDatabase('supabase-auth-client'); } catch (e) {}
      }
      if (typeof supabase.removeAllChannels === 'function') {
        supabase.removeAllChannels();
      }
      toast.success('Logged out successfully!');
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 300);
    } catch (error) {
      toast.error('Logout failed.');
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };


  // Render login buttons directly (guaranteed to show)
  const renderAuthButtons = () => (
    <div className="ml-4 flex items-center space-x-3">
      <Link
        to="/auth/login"
        className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        {t('common.login', 'Sign In')}
      </Link>
      <Link
        to="/auth/register"
        className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
      >
        {t('common.register', 'Sign Up')}
      </Link>
    </div>
  );

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="D-CARS"
              />
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {/* Common Links for all users */}
              <Link
                to="/cars"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('common.search', 'Browse Cars')}
              </Link>
              
              <Link
                to="/about-us"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('common.aboutUs', 'About Us')}
              </Link>
              
              <Link
                to="/contact-us"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('common.contactUs', 'Contact Us')}
              </Link>
              
              {/* User-specific links (only shown when logged in) */}
              {isLoggedIn && (
                <>
                  <Link
                    to="/dashboard/my-listings"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <TruckIcon className="h-5 w-5 mr-1" />
                    {t('common.myListings', 'My Listings')}
                  </Link>
                  <Link
                    to="/dashboard/saved"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <HeartIcon className="h-5 w-5 mr-1" />
                    {t('common.savedCars', 'Saved Cars')}
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <ChartBarSquareIcon className="h-5 w-5 mr-1" />
                    {t('common.dashboard', 'Dashboard')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side: Theme toggle, Language selector, Auth buttons or User menu */}
          <div className="flex items-center">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <Menu as="div" className="ml-4 relative">
              <Menu.Button 
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t('navigation.language', 'Language')}
                title={t('navigation.language', 'Language')}
              >
                <GlobeAltIcon className="h-5 w-5" />
                <span>{i18n.language === 'en' ? 'EN' : 'FR'}</span>
              </Menu.Button>
              
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } ${i18n.language === 'en' ? 'bg-gray-50 dark:bg-gray-600 font-medium' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        onClick={() => {
                          i18n.changeLanguage('en');
                          localStorage.setItem('userLanguage', 'en');
                        }}
                      >
                        <span className="mr-2">🇬🇧</span> English
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } ${i18n.language === 'fr' ? 'bg-gray-50 dark:bg-gray-600 font-medium' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        onClick={() => {
                          i18n.changeLanguage('fr');
                          localStorage.setItem('userLanguage', 'fr');
                        }}
                      >
                        <span className="mr-2">🇫🇷</span> Français
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* 
              IMPORTANT: Always render auth buttons for non-authenticated users
              OR when authentication is still loading (auth.isLoading)
              This ensures buttons are visible during authentication checks
            */}
            {(!isLoggedIn || auth.isLoading) && renderAuthButtons()}

            {/* User Menu - only when logged in and not loading */}
            {isLoggedIn && !auth.isLoading && (
              <Menu as="div" className="ml-4 relative">
                <Menu.Button className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/profile"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                        >
                          <UserCircleIcon className="h-5 w-5 mr-2" />
                          {t('common.profile', 'Profile')}
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/settings"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                        >
                          <CogIcon className="h-5 w-5 mr-2" />
                          {t('common.settings', 'Settings')}
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center disabled:opacity-60`}
                          onClick={useAuth().signOut}
                          disabled={isLoggingOut}
                          title="Logout"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          {isLoggingOut ? t('common.loggingOut', 'Logging out...') : t('common.logout', 'Logout')}
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
      
      {/* 
        IMPORTANT: Always show login/signup banner at bottom when:
        1. User is not logged in OR
        2. Authentication is still being checked (loading)
        This ensures buttons are always visible during auth checks
      */}
      {(!isLoggedIn || auth.isLoading) && (
        <div className="bg-primary-600 text-white py-2 px-4">
          <div className="container mx-auto flex justify-center items-center gap-4">
            <span>Need an account?</span>
            <Link
              to="/auth/login"
              className="px-3 py-1 text-sm font-medium bg-white text-primary-600 rounded hover:bg-gray-100"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="px-3 py-1 text-sm font-medium border border-white text-white rounded hover:bg-primary-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;