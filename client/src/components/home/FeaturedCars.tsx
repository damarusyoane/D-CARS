import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

// Fix for session/data staleness: refetch on auth state change
import { useRef } from 'react';
function useSupabaseAuthListener(refetch: () => void) {
  const lastUserId = useRef<string | null>(null);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null;
      if (userId !== lastUserId.current) {
        lastUserId.current = userId;
        refetch();
      }
    });
    return () => subscription.unsubscribe();
  }, [refetch]);
}


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
  console.log("FeaturedCars mounted");
  const { t } = useTranslation();
  const [featuredCars, setFeaturedCars] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch featured cars, and expose refetch for auth/session changes
  const fetchFeaturedCars = async () => {
    console.log("fetchFeaturedCars called");
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log("About to query Supabase");
      const startTime = Date.now();
      // Add a timeout for the query
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timed out')), 5000)
      );
      try {
        const result = await Promise.race([
          supabase
            .from('vehicles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6),
          timeout
        ]) as { data: any[]; error: any };

        const data = result.data;
        const error = result.error;
        console.log(`[Supabase] Query finished in ${Date.now() - startTime}ms`);
        console.log('[Supabase] Data:', data);
        console.log('[Supabase] Error:', error);

        if (error) {
          setError(error);
          setFeaturedCars([]);
          setIsLoading(false);
          return;
        }
        setFeaturedCars((data || []).map((v: any) => ({
          ...v,
          status: v.status ?? '',
        })));
        setIsLoading(false);
      } catch (queryErr) {
        console.error('[Supabase] Query threw error:', queryErr);
        setError(queryErr instanceof Error ? queryErr : new Error('Unknown error'));
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[Supabase] Outer catch error fetching featured cars:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setFeaturedCars([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedCars();
    // eslint-disable-next-line
  }, []);
  useSupabaseAuthListener(fetchFeaturedCars);


  // Add a timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setError(new Error('Loading timed out. Please try again.'));
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-500 py-8">{error.message}</p>
        </div>
      </div>
    );
  }

  if (featuredCars.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 py-8">{t('noFeaturedCars', 'No featured cars available at the moment.')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {t('home.featured.title', 'Nos Top Annonces')}
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            {t('home.featured.description', 'Regarder nos meilleurs annonces ci-dessous')}
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
                  XAF {car.price?.toLocaleString() || '0'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {car.mileage?.toLocaleString() || '0'} Km
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
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            {t('home.featured.viewAll', 'Voir tous les annonces')}
          </Link>
        </div>
      </div>
    </div>
  );
}
