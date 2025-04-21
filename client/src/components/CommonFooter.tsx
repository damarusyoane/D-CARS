import { Link } from 'react-router-dom';

export default function CommonFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              About
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/help" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Social
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} D-CARS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 