import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/navigation/Footer';
import TestimonialsSection from '../components/TestimonialsSection';

// Import component sections
import HeroSection from '../components/home/HeroSection';
import FeaturedCars from '../components/home/FeaturedCars';
import { 
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Voitures en vedette Section */}
      <FeaturedCars />
      
      {/* Pourquoi nous choisir */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pourquoi choisir D-CARS</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Notre plateforme combine la technologie blockchain à un marché convivial pour offrir la meilleure expérience d'achat et de vente de véhicules.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Transactions Sécurisées</h3>
              <p className="text-gray-600 dark:text-gray-300">Toutes les transactions sont sécurisées par la technologie blockchain, garantissant transparence et sécurité.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Tarification Compétitive</h3>
              <p className="text-gray-600 dark:text-gray-300">Notre marché connecte directement acheteurs et vendeurs, éliminant les intermédiaires et réduisant les coûts.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <TruckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Véhicules Vérifiés</h3>
              <p className="text-gray-600 dark:text-gray-300">Chaque annonce de véhicule fait l'objet d'un processus de vérification pour garantir des informations précises.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Communauté Dynamique</h3>
              <p className="text-gray-600 dark:text-gray-300">Notre plateforme est construite autour d'une communauté de passionnés d'automobiles qui partagent des avis et des perspectives.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Accès Rapide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              to="/cars" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Parcourir les voitures</h3>
              <p className="text-gray-600 dark:text-gray-300">Explorez notre large sélection de véhicules</p>
            </Link>
            <Link 
              to="/cart" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Panier</h3>
              <p className="text-gray-600 dark:text-gray-300">Consultez et gérez votre panier</p>
            </Link>
            <Link 
              to="/subscription" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Formules d'abonnement</h3>
              <p className="text-gray-600 dark:text-gray-300">Choisissez ou gérez votre formule</p>
            </Link>
            {user ? (
              <>
                <Link 
                  to="/my-listings" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Mes annonces</h3>
                  <p className="text-gray-600 dark:text-gray-300">Gérez vos annonces de véhicules</p>
                </Link>
                <Link 
                  to="/messages" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Messages</h3>
                  <p className="text-gray-600 dark:text-gray-300">Consultez et gérez vos conversations</p>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/auth/login" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Connexion</h3>
                  <p className="text-gray-600 dark:text-gray-300">Connectez-vous à votre compte</p>
                </Link>
                <Link 
                  to="/auth/register" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Inscription</h3>
                  <p className="text-gray-600 dark:text-gray-300">Créez un nouveau compte</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary-600 dark:bg-primary-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à Commencer ?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui profitent déjà de notre plateforme d'achat et de vente de véhicules.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link 
                to="/dashboard/create-listing" 
                className="px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Vendez Votre Voiture
              </Link>
            ) : (
              <Link 
                to="/auth/register" 
                className="px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Créer un Compte
              </Link>
            )}
            <Link 
              to="/about" 
              className="px-8 py-3 bg-primary-700 text-white font-medium rounded-md hover:bg-primary-800 transition-colors"
            >
              En Savoir Plus
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      {/* Community Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Rejoignez Notre Communauté</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Connectez-vous avec des passionnés d'automobiles, partagez vos expériences et restez informé des dernières tendances automobiles.
              </p>
              <Link 
                to="/community" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                Explorer la Communauté
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=700&q=80" 
                alt="Car enthusiasts meeting" 
                className="rounded-lg shadow-md w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

export default Index;