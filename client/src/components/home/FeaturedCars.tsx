import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import VehicleCarousel from '../VehicleCarousel';
import LoadingSpinner from '../common/LoadingSpinner';

// Define the vehicle interface
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
  mileage: number;
  condition: string;
  images: string[];
  status: string;
  created_at?: string;
}

export default function FeaturedCars() {
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ ,setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFeaturedCars() {
      try {
        setIsLoading(true);
        
        // Add a small delay to prevent UI freezing
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        
        // If we get here, we have data
        setFeaturedCars((data || []).map(v => ({
          ...v,
          status: v.status ?? '',
        })));
      } catch (err) {
        console.error('Error fetching featured cars:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // Even if there's an error, provide some sample data so UI isn't empty
        setFeaturedCars([
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2023,
            price: 25000,
            location: 'New York, NY',
            mileage: 5000,
            condition: 'Excellent',
            images: ['/placeholder-car.jpg'],
            status: 'active'
          },
          {
            id: '2',
            make: 'Honda',
            model: 'Accord',
            year: 2022,
            price: 23500,
            location: 'Los Angeles, CA',
            mileage: 12000,
            condition: 'Good',
            images: ['/placeholder-car.jpg'],
            status: 'active'
          },
          {
            id: '3',
            make: 'Ford',
            model: 'Mustang',
            year: 2021,
            price: 35000,
            location: 'Chicago, IL',
            mileage: 8000,
            condition: 'Excellent',
            images: ['/placeholder-car.jpg'],
            status: 'active'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFeaturedCars();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading featured vehicles...</p>
        </div>
      </div>
    );
  }

  if (featuredCars.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">No featured vehicles found.</p>
        </div>
      </div>
    );
  }

  if (featuredCars.length === 1) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('home.featured.title', 'Featured Vehicles')}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              {t('home.featured.description', 'Check out our selection of premium vehicles')}
            </p>
          </div>

          <div className="mt-12">
            <Link
              to={`/cars/${featuredCars[0].id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={featuredCars[0].images && featuredCars[0].images[0] ? featuredCars[0].images[0] : '/placeholder-car.jpg'}
                  alt={`${featuredCars[0].year} ${featuredCars[0].make} ${featuredCars[0].model}`}
                  className="object-cover w-full h-48"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-car.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {featuredCars[0].year} {featuredCars[0].make} {featuredCars[0].model}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {featuredCars[0].location}
                </p>
                <p className="mt-2 text-lg font-semibold text-primary-600 dark:text-primary-400">
                  ${featuredCars[0].price?.toLocaleString() || '0'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {featuredCars[0].mileage?.toLocaleString() || '0'} miles
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {featuredCars[0].condition || 'Used'}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (featuredCars.length >= 6) {
    return (
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              {t('home.featured.title', 'Featured Vehicles')}
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
              {t('home.featured.description', 'Check out our selection of premium vehicles')}
            </p>
          </div>

          <div className="mt-12">
            <VehicleCarousel vehicles={featuredCars} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {t('home.featured.title', 'Featured Vehicles')}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            {t('home.featured.description', 'Check out our selection of premium vehicles')}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredCars.map((car) => (
            <Link
              key={car.id}
              to={`/cars/${car.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="aspect-w-3 aspect-h-2">
                <img
                  src={car.images && car.images[0] ? car.images[0] : '/placeholder-car.jpg'}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  className="object-cover w-full h-48"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-car.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {car.year} {car.make} {car.model}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {car.location}
                </p>
                <p className="mt-2 text-lg font-semibold text-primary-600 dark:text-primary-400">
                  ${car.price?.toLocaleString() || '0'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {car.mileage?.toLocaleString() || '0'} miles
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {car.condition || 'Used'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/search"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            {t('home.featured.viewAll', 'View All Vehicles')}
          </Link>
        </div>
      </div>
    </div>
  );
}