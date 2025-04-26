import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'react-hot-toast';
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
 * AuthenticatedNavbar - Navbar component shown only to authenticated users
 * Contains user-specific navigation links and user menu
 */
export default function AuthenticatedNavbar() {
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name || user?.email || 'User';

  // Robust logout handler (copied from AdminDashboard)
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
              {/* Welcome message using the displayName */}
              <div className="text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-medium">
                {t('common.welcome', 'Welcome')}, {displayName}!
              </div>
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
              {/* User-specific navigation links */}
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
              <Link
                to="/dashboard/messages"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <ChatBubbleLeftIcon className="h-5 w-5 mr-1" />
                {t('common.messages', 'Messages')}
              </Link>
              <Link
                to="/dashboard/transactions"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <ReceiptRefundIcon className="h-5 w-5 mr-1" />
                {t('common.transactions', 'Transactions')}
              </Link>
            </div>
          </div>

          {/* Right side: Theme toggle, Language selector, User menu */}
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

            {/* User Menu */}
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
                        to="/dashboard/my-listings"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center md:hidden`}
                      >
                        <TruckIcon className="h-5 w-5 mr-2" />
                        {t('common.myListings', 'My Listings')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard/saved"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center md:hidden`}
                      >
                        <HeartIcon className="h-5 w-5 mr-2" />
                        {t('common.savedCars', 'Saved Cars')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center md:hidden`}
                      >
                        <ChartBarSquareIcon className="h-5 w-5 mr-2" />
                        {t('common.dashboard', 'Dashboard')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard/messages"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center md:hidden`}
                      >
                        <ChatBubbleLeftIcon className="h-5 w-5 mr-2" />
                        {t('common.messages', 'Messages')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard/transactions"
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center md:hidden`}
                      >
                        <ReceiptRefundIcon className="h-5 w-5 mr-2" />
                        {t('common.transactions', 'Transactions')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="/dashboard/settings"
                        className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} block px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <CogIcon className="h-5 w-5 mr-2 inline" />
                        {t('common.settings', 'Settings')}
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`${active ? 'bg-gray-100 dark:bg-gray-600' : ''} block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                        title="Logout"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 inline" />
                        {isLoggingOut ? t('common.loggingOut', 'Logging out...') : t('common.logout', 'Logout')}
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                        title={t('common.logout', 'Sign Out')}
                        onClick={async () => {
                          console.log('Sign out clicked', signOut);
                          if (signOut) {
                            try {
                              await signOut();

                              // Remove all Supabase keys from localStorage and sessionStorage
                              [localStorage, sessionStorage].forEach(storage => {
                                Object.keys(storage)
                                  .filter((key) => key.startsWith('sb-'))
                                  .forEach((key) => storage.removeItem(key));
                              });

                              // Remove Supabase keys from IndexedDB (optional, for max reliability)
                              if ('indexedDB' in window) {
                                try {
                                  window.indexedDB.deleteDatabase('supabase-auth-client');
                                } catch (e) {}
                              }

                              // Remove all realtime channels if available
                              if (typeof supabase.removeAllChannels === 'function') {
                                supabase.removeAllChannels();
                              }

                              // Debug: log storage and user state
                              console.log('After logout:');
                              console.log('localStorage:', {...localStorage});
                              console.log('sessionStorage:', {...sessionStorage});
                              console.log('user:', user);

                              setTimeout(() => {
                                window.location.href = '/auth/login';
                              }, 500);
                            } catch (err) {
                              toast.error(t('auth.signOutError', 'Failed to sign out.'));
                            }
                          } else {
                            toast.error('Sign out function not available.');
                          }
                        }}
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                        {t('common.logout', 'Sign Out')}
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </nav>
  );
}
