import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CallToAction: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-primary-600 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Car?
          </h2>
          <p className="text-primary-100 mb-8">
            Join thousands of satisfied customers who found their dream car through D-CARS.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <Link
                to="/auth/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Create Account
              </Link>
            )}
            <Link
              to="/cars"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 hover:bg-primary-800"
            >
              Browse Cars
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard/create-listing"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                List Your Car
              </Link>
            )}
          </div>

          <div className="mt-8">
            <p className="text-primary-100 text-sm">
              Subscribe to our newsletter for exclusive deals and updates
            </p>
            <div className="flex flex-col md:flex-row gap-2 max-w-lg mx-auto mt-4">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;