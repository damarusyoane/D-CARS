import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import {
  UserCircleIcon,
  GlobeAltIcon,
  HeartIcon,
  ChartBarSquareIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  TruckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

import ThemeToggle from '../common/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

function Navbar() {
  const { i18n } = useTranslation();
  const auth = useAuth();
  const isLoggedIn = !!auth.user;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    console.log('État de l\'authentification mis à jour:', { 
      utilisateur: auth.user, 
      chargement: auth.isLoading 
    });
  }, [auth.user, auth.isLoading]);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center relative">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              className="h-10 w-auto"
              src="/assets/logo.png"
              alt="D-CARS"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link 
              to="/cars" 
              className="text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors duration-300"
            >
              Rechercher des Véhicules
            </Link>
            <Link 
              to="/about-us" 
              className="text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors duration-300"
            >
              À Propos
            </Link>
            <Link 
              to="/contact-us" 
              className="text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors duration-300"
            >
              Nous Contacter
            </Link>

            {isLoggedIn && (
              <>
                <Link 
                  to="/dashboard/my-listings" 
                  className="text-gray-900 dark:text-gray-100 hover:text-primary-600 flex items-center transition-colors duration-300"
                >
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Mes Annonces
                </Link>
                <Link 
                  to="/dashboard/saved" 
                  className="text-gray-900 dark:text-gray-100 hover:text-primary-600 flex items-center transition-colors duration-300"
                >
                  <HeartIcon className="h-5 w-5 mr-2" />
                  Voitures Sauvegardées
                </Link>
                <Link 
                  to="/dashboard" 
                  className="text-gray-900 dark:text-gray-100 hover:text-primary-600 flex items-center transition-colors duration-300"
                >
                  <ChartBarSquareIcon className="h-5 w-5 mr-2" />
                  Tableau de Bord
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {/* Language Selector */}
            <Menu as="div" className="relative">
              <Menu.Button 
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors duration-300"
                aria-label="Sélecteur de langue"
              >
                <GlobeAltIcon className="h-6 w-6" />
                <span className="ml-2 text-sm">
                  {i18n.language === 'fr' ? 'FR' : 'EN'}
                </span>
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
                <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          i18n.changeLanguage('fr');
                          localStorage.setItem('userLanguage', 'fr');
                        }}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
                      >
                        Français
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => {
                          i18n.changeLanguage('en');
                          localStorage.setItem('userLanguage', 'en');
                        }}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
                      >
                        English
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>

            {/* Authentication Buttons */}
            {!isLoggedIn ? (
              <div className="hidden md:flex space-x-3">
                <Link 
                  to="/auth/login" 
                  className="btn btn-outline btn-primary rounded-full px-4 py-2 text-sm transition-transform hover:scale-105"
                >
                  Connexion
                </Link>
                <Link 
                  to="/auth/register" 
                  className="btn btn-primary rounded-full px-4 py-2 text-sm transition-transform hover:scale-105"
                >
                  S'inscrire
                </Link>
              </div>
            ) : (
              <Menu as="div" className="relative">
                <Menu.Button className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors duration-300" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/profile"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
                        >
                          <UserCircleIcon className="h-5 w-5 mr-2" />
                          Profil
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/dashboard/settings"
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
                        >
                          <CogIcon className="h-5 w-5 mr-2" />
                          Paramètres
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={auth.signOut}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-600' : ''
                          } w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 flex items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300`}
                        >
                          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                          Déconnexion
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
              aria-label="Toggle mobile menu"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-black/50 z-[100]" onClick={toggleMobileMenu}>
            <div 
              className="absolute top-0 left-0 w-full bg-white dark:bg-gray-800 shadow-lg z-[110] max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={toggleMobileMenu} 
                className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <div className="px-4 pt-16 pb-6 space-y-1">
                <Link 
                to="/cars" 
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleMobileMenu}
              >
                Rechercher des Véhicules
              </Link>
              <Link 
                to="/about-us" 
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleMobileMenu}
              >
                À Propos
              </Link>
              <Link 
                to="/contact-us" 
                className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleMobileMenu}
              >
                Nous Contacter
              </Link>

              {isLoggedIn && (
                <>
                  <Link 
                    to="/dashboard/my-listings" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={toggleMobileMenu}
                  >
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Mes Annonces
                  </Link>
                  <Link 
                    to="/dashboard/saved" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={toggleMobileMenu}
                  >
                    <HeartIcon className="h-5 w-5 mr-2" />
                    Voitures Sauvegardées
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    onClick={toggleMobileMenu}
                  >
                    <ChartBarSquareIcon className="h-5 w-5 mr-2" />
                    Tableau de Bord
                  </Link>
                </>
              )}

              {/* Authentication Links for Mobile */}
              {!isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Link 
                    to="/auth/login" 
                    className="block w-full text-center px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                    onClick={toggleMobileMenu}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/auth/register" 
                    className="block w-full text-center px-3 py-2 text-sm font-medium text-primary-600 bg-white border border-primary-600 hover:bg-primary-50 rounded-md"
                    onClick={toggleMobileMenu}
                  >
                    S'inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar();