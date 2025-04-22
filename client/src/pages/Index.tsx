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
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Featured Cars Section */}
      <FeaturedCars />
      
      {/* Why Choose Us Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why Choose D-CARS</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform combines blockchain technology with a user-friendly marketplace to provide the best car buying and selling experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Secure Transactions</h3>
              <p className="text-gray-600 dark:text-gray-300">All transactions are secured by blockchain technology, ensuring transparency and security.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Competitive Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">Our marketplace connects buyers and sellers directly, eliminating middlemen and reducing costs.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <TruckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Verified Vehicles</h3>
              <p className="text-gray-600 dark:text-gray-300">Each vehicle listing undergoes a verification process to ensure accurate information.</p>
            </div>
            
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white mb-4">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Community Driven</h3>
              <p className="text-gray-600 dark:text-gray-300">Our platform is built around a community of car enthusiasts who share reviews and insights.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Access Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              to="/cars" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Browse Cars</h3>
              <p className="text-gray-600 dark:text-gray-300">Explore our wide selection of vehicles</p>
            </Link>
            <Link 
              to="/cart" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Cart</h3>
              <p className="text-gray-600 dark:text-gray-300">View and manage your cart</p>
            </Link>
            <Link 
              to="/subscription" 
              className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Subscription Plans</h3>
              <p className="text-gray-600 dark:text-gray-300">Choose or manage your plan</p>
            </Link>
            {user ? (
              <>
                <Link 
                  to="/my-listings" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">My Listings</h3>
                  <p className="text-gray-600 dark:text-gray-300">Manage your vehicle listings</p>
                </Link>
                <Link 
                  to="/messages" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Messages</h3>
                  <p className="text-gray-600 dark:text-gray-300">View and manage your conversations</p>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/auth/login" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Login</h3>
                  <p className="text-gray-600 dark:text-gray-300">Sign in to your account</p>
                </Link>
                <Link 
                  to="/auth/register" 
                  className="p-6 bg-white dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Register</h3>
                  <p className="text-gray-600 dark:text-gray-300">Create a new account</p>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-primary-600 dark:bg-primary-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users already enjoying our platform for buying and selling vehicles.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link 
                to="/dashboard/create-listing" 
                className="px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Sell Your Car
              </Link>
            ) : (
              <Link 
                to="/auth/register" 
                className="px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Create an Account
              </Link>
            )}
            <Link 
              to="/about" 
              className="px-8 py-3 bg-primary-700 text-white font-medium rounded-md hover:bg-primary-800 transition-colors"
            >
              Learn More
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Our Community</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Connect with car enthusiasts, share your experiences, and stay updated with the latest automotive trends.
              </p>
              <Link 
                to="/community" 
                className="inline-flex items-center px-6 py-3 bg-primary-600 dark:bg-primary-500 text-white font-medium rounded-md hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
              >
                Explore Community
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