import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { vehicles } = useVehicles();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const featuredVehicles = vehicles?.slice(0, 6) || [];
  const recentVehicles = vehicles?.slice(-6) || [];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-bold text-base-content mb-6">
                Find Your Perfect Vehicle
              </h1>
              <p className="text-lg text-base-content/80 mb-8">
                Browse through thousands of vehicles and find the one that matches your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                  <input
                    type="text"
                    placeholder="Search cars, models, or brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-base-100 rounded-lg border border-base-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn btn-primary"
                >
                  <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Vehicles</h2>
          <Link to="/browse" className="text-primary hover:text-primary/80">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredVehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card bg-base-100 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <figure className="relative h-48">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="badge badge-primary">
                    {vehicle.status}
                  </span>
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-base-content/70">
                  {vehicle.year} • {vehicle.mileage.toLocaleString()} miles
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ${vehicle.price.toLocaleString()}
                  </span>
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Listings */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Listings</h2>
          <Link to="/browse" className="text-primary hover:text-primary/80">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentVehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card bg-base-100 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <figure className="relative h-48">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="badge badge-primary">
                    {vehicle.status}
                  </span>
                </div>
              </figure>
              <div className="card-body">
                <h3 className="card-title">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-base-content/70">
                  {vehicle.year} • {vehicle.mileage.toLocaleString()} miles
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">
                    ${vehicle.price.toLocaleString()}
                  </span>
                  <Link
                    to={`/vehicles/${vehicle.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Advanced Marketplace Features */}
      <section className="bg-base-200 rounded-2xl p-12 mb-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Marketplace Innovations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
              <img src="/assets/offer-icon.svg" alt="Offers" className="h-12 w-12 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Make & Manage Offers</h3>
              <p className="text-base-content/70 mb-4">Negotiate prices directly with sellers or manage offers on your vehicles.</p>
              <Link to="/dashboard/offers" className="btn btn-primary btn-sm">Go to Offers</Link>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
              <img src="/assets/report-icon.svg" alt="Reports" className="h-12 w-12 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Vehicle Reports</h3>
              <p className="text-base-content/70 mb-4">Access and verify vehicle history reports for peace of mind and transparency.</p>
              <Link to="/dashboard/reports" className="btn btn-primary btn-sm">View Reports</Link>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center">
              <img src="/assets/feature-icon.svg" alt="Enhanced Features" className="h-12 w-12 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Enhanced Listing Features</h3>
              <p className="text-base-content/70 mb-4">Boost your listings with premium features and gain more visibility.</p>
              <Link to="/dashboard/features" className="btn btn-primary btn-sm">Manage Features</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose D-CARS? */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose D-CARS?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-base-content/70">
                Your safety is our priority. All transactions are secure and protected.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast & Easy</h3>
              <p className="text-base-content/70">
                List or find your perfect vehicle in minutes with our streamlined process.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-base-content/70">
                Our dedicated support team is always here to help you.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 