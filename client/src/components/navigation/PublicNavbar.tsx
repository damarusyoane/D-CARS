import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../common/ThemeToggle';

/**
 * PublicNavbar - Navbar component shown only to non-authenticated users
 * Contains public navigation links and authentication buttons
 */
export default function PublicNavbar() {
  const { t, i18n } = useTranslation();

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
            </div>
          </div>

          {/* Right side: Theme toggle, Language selector, Auth buttons */}
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

            {/* Authentication Buttons - Always visible in public navbar */}
            <div className="ml-4 flex items-center space-x-3">
              <Link
                to="/auth/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('common.login', 'Sign In')}
              </Link>
              <Link
                to="/auth/register"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                {t('common.register', 'Sign Up')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
