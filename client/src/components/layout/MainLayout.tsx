import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ChevronDownIcon,
  UserIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  PhoneIcon,
  ShoppingCartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const MainLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  // Main navigation links
  const mainNavigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Search Cars', href: '/cars', icon: MagnifyingGlassIcon },
    { name: 'About Us', href: '/about', icon: InformationCircleIcon },
    { name: 'Contact Us', href: '/contact', icon: PhoneIcon },
    { name: 'Subscription', href: '/subscription', icon: ShoppingCartIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon },
    { name: 'Community', href: '/community', icon: UserGroupIcon },
  ];

  // Dashboard links for dropdown
  const dashboardLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: UserIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Messages', href: '/dashboard/messages', icon: UserIcon },
    { name: 'Saved Cars', href: '/dashboard/saved', icon: UserIcon },
    { name: 'My Listings', href: '/dashboard/listings', icon: UserIcon },
    { name: 'Create Listing', href: '/dashboard/create-listing', icon: UserIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-500">
                  D-CARS
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      location.pathname === item.href
                        ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    <item.icon className="h-5 w-5 mr-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* User options and dropdown */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Pages dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                    >
                      <span>Pages</span>
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {dashboardLinks.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                            >
                              <div className="flex items-center">
                                <item.icon className="h-5 w-5 mr-2" />
                                {item.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    <UserIcon className="h-5 w-5 mr-1" />
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/auth/login"
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/auth/register"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500 focus:outline-none"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {mainNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-primary-600 text-white dark:bg-primary-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } flex items-center px-3 py-2 text-base font-medium`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2">
                  <p className="text-base font-medium text-gray-800 dark:text-gray-200">Dashboard</p>
                </div>
                <div className="space-y-1">
                  {dashboardLinks.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  <Link
                    to="/auth/login"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="flex items-center px-3 py-2 text-base font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <Link to="/" className="text-2xl font-bold text-primary-600 dark:text-primary-500">D-CARS</Link>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Your trusted platform for buying and selling vehicles with blockchain technology.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">Navigation</h3>
              <ul className="mt-4 space-y-4">
                {mainNavigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                      {item.name}
                    </Link>
                  </li>
                ))}
                {/* Ensure Cart is present even if not in mainNavigation */}
                {!mainNavigation.some(item => item.name === 'Cart') && (
                  <li>
                    <Link to="/cart" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                      Cart
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">Account</h3>
              <ul className="mt-4 space-y-4">
                {user ? (
                  <>
                    <li>
                      <Link to="/dashboard" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/profile" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/dashboard/settings" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                        Settings
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/auth/login" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link to="/auth/register" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                        Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">Contact</h3>
              <ul className="mt-4 space-y-4">
                <li className="text-base text-gray-600 dark:text-gray-300">
                  Email: support@d-cars.com
                </li>
                <li className="text-base text-gray-600 dark:text-gray-300">
                  Phone: (123) 456-7890
                </li>
                <li>
                  <Link to="/contact" className="text-base text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-500">
                    Contact Form
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-base text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} D-CARS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;