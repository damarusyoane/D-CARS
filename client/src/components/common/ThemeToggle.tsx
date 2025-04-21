import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Get the appropriate icon for current theme
  const getThemeIcon = () => {
    if (theme === 'system') {
      return <ComputerDesktopIcon className="h-5 w-5" />;
    } else if (resolvedTheme === 'dark') {
      return <MoonIcon className="h-5 w-5" />;
    } else {
      return <SunIcon className="h-5 w-5" />;
    }
  };

  return (
    <Menu as="div" className="relative">
      <Menu.Button 
        className="flex items-center gap-1 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
        aria-label={t('settings.themeToggle')}
        title={t('settings.themeToggle')}
      >
        {getThemeIcon()}
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
                } ${theme === 'light' ? 'bg-gray-50 dark:bg-gray-600 font-medium' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                onClick={() => setTheme('light')}
              >
                <SunIcon className="h-5 w-5 mr-2 text-yellow-500" /> 
                {t('settings.lightMode')}
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-600' : ''
                } ${theme === 'dark' ? 'bg-gray-50 dark:bg-gray-600 font-medium' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                onClick={() => setTheme('dark')}
              >
                <MoonIcon className="h-5 w-5 mr-2 text-blue-500" /> 
                {t('settings.darkMode')}
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`${
                  active ? 'bg-gray-100 dark:bg-gray-600' : ''
                } ${theme === 'system' ? 'bg-gray-50 dark:bg-gray-600 font-medium' : ''} flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                onClick={() => setTheme('system')}
              >
                <ComputerDesktopIcon className="h-5 w-5 mr-2 text-gray-500" /> 
                {t('settings.systemTheme')}
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
