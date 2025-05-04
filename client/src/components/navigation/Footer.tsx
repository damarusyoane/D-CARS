import { Link } from 'react-router-dom';


function Footer() {
 
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              className="h-10 w-auto"
              src="/assets/logo.png"
              alt="D-CARS"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Votre partenaire de confiance pour trouver la voiture de vos rêves.
            </p>
          </div>

          {/* Company Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Entreprise
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/about"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600"
                >
                  À Propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Légal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  to="/privacy"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600"
                >
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-primary-600"
                >
                  Conditions d'Utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Réseaux Sociaux
            </h3>
            <div className="mt-4 flex space-x-6">
              {/* Facebook Icon */}
              <a href="#" className="text-gray-400 hover:text-primary-600">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              {/* Instagram Icon */}
              <a href="#" className="text-gray-400 hover:text-primary-600">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  {/* Instagram SVG path */}
                </svg>
              </a>
            </div>
            
            {/* Copyright */}
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} D-CARS. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 