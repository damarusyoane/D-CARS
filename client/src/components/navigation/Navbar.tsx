import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect } from 'react';
import {
  UserCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarSquareIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
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
  const auth = useAuth();
  const isLoggedIn = !!auth.user;

  // Use local state to track login status for more reliable rendering
  useEffect(() => {
    // Check if user is logged in
    console.log('Auth state updated:', { 
      user: auth.user, 
      isLoading: auth.isLoading 
    });
  }, [auth.user, auth.isLoading]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation Links */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/assets/logo.png"
                alt="D-CARS"
              />
            </Link>
            {/* Desktop nav links */}
<div className="hidden md:ml-6 md:flex md:space-x-4">
              {/* Common Links for all users */}
              <Link
                to="/cars"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('Search', 'Browse Cars')}
              </Link>
              
              <Link
                to="/about-us"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('AboutUs', 'About Us')}
              </Link>
              
              <Link
                to="/contact-us"
                className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('ContactUs', 'Contact Us')}
              </Link>
              
              {/* User-specific links (only shown when logged in) */}
              {isLoggedIn && (
                <>
                  <Link
                    to="/dashboard/my-listings"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <TruckIcon className="h-5 w-5 mr-1" />
                    {t('MyListings', 'My Listings')}
                  </Link>
                  <Link
                    to="/dashboard/saved"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <HeartIcon className="h-5 w-5 mr-1" />
                    {t('SavedCars', 'Saved Cars')}
                  </Link>
                  <Link
                    to="/dashboard"
                    className="text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <ChartBarSquareIcon className="h-5 w-5 mr-1" />
                    {t('Dashboard', 'Dashboard')}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right side: Theme toggle, Language selector, Auth buttons or User menu */}
          {/* Hamburger for mobile */}
<div className="flex items-center md:hidden">
  <Menu as="div" className="relative">
    <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
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
      <Menu.Items className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        {/* Place mobile nav links and user menu here, similar to desktop */}
        <div className="px-4 py-2 space-y-1">
          <Link to="/cars" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('Search', 'Browse Cars')}</Link>
          <Link to="/about-us" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('AboutUs', 'About Us')}</Link>
          <Link to="/contact-us" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('ContactUs', 'Contact Us')}</Link>
          {isLoggedIn && (
            <>
              <Link to="/dashboard/my-listings" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('MyListings', 'My Listings')}</Link>
              <Link to="/dashboard/saved" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('SavedCars', 'Saved Cars')}</Link>
              <Link to="/dashboard" className="block text-gray-900 dark:text-gray-100 hover:text-primary-600 px-3 py-2 rounded-md text-base font-medium">{t('Dashboard', 'Dashboard')}</Link>
              
                        <button
                          className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                          onClick={auth.signOut}
                          title="Logout"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          {t('logout', 'Logout')}
                        </button>
                      
            </>
          )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
        {/* Auth/User menu */}
        {(!isLoggedIn || auth.isLoading) ? (
          <>
            <Link to="/auth/login" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{t('login', 'Se Connecter')}</Link>
            <Link to="/auth/register" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{t('register', 'S\'inscrire')}</Link>
          </>
        ) : (
          <Menu.Item>
            {() => (
              <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{t('profile', 'Profil')}</Link>
            )}
          </Menu.Item>
        )}
      </Menu.Items>
    </Transition>
  </Menu>
</div>

{/* Desktop right side */}
<div className="flex items-center hidden md:flex">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector */}
            <Menu as="div" className="ml-4 relative">
              <Menu.Button 
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t('language', 'Language')}
                title={t('language', 'Language')}
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
            {(!isLoggedIn || auth.isLoading) && (
              <>
                <Link to="/auth/login" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">Sign In</Link>
                <Link to="/auth/register" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">Sign Up</Link>
              </>
            )}

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
                          {t('profile', 'Profile')}
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
                          {t('settings', 'Settings')}
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center`}
                          onClick={auth.signOut}
                          title="Logout"
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          {t('logout', 'Logout')}
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