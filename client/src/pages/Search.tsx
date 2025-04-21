import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  AdjustmentsHorizontalIcon,
  
  XMarkIcon,
} from '@heroicons/react/24/outline';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface Filters {
  priceRange: [number, number];
  yearRange: [number, number];
  mileageRange: [number, number];
  make: string[];
  model: string[];
  transmission: string[];
  fuelType: string[];
}

const initialFilters: Filters = {
  priceRange: [0, 1000000],
  yearRange: [1990, new Date().getFullYear()],
  mileageRange: [0, 500000],
  make: [],
  model: [],
  transmission: [],
  fuelType: [],
};

export default function Search() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'mileage_asc'>('newest');

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', filters, sortBy, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'available')
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
        .gte('year', filters.yearRange[0])
        .lte('year', filters.yearRange[1])
        .gte('mileage', filters.mileageRange[0])
        .lte('mileage', filters.mileageRange[1]);

      if (filters.make.length > 0) {
        query = query.in('make', filters.make);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'mileage_asc':
          query = query.order('mileage', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex h-full">
      {/* Filters Sidebar */}
      <div
        className={`fixed lg:relative lg:block inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 transform ${
          isFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-200 ease-in-out shadow-lg lg:shadow-none`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => setFilters({
                  ...filters,
                  priceRange: [Number(e.target.value), filters.priceRange[1]]
                })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(e.target.value)]
                })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          {/* Year Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Year</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.yearRange[0]}
                onChange={(e) => setFilters({
                  ...filters,
                  yearRange: [Number(e.target.value), filters.yearRange[1]]
                })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                placeholder="From"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                value={filters.yearRange[1]}
                onChange={(e) => setFilters({
                  ...filters,
                  yearRange: [filters.yearRange[0], Number(e.target.value)]
                })}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm"
                placeholder="To"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => setFilters(initialFilters)}
            className="mt-auto w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Search Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm p-4 mb-6 rounded-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicles..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage_asc">Lowest Mileage</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles?.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  {vehicle.images?.[0] && (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {vehicle.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.make} {vehicle.model} • {vehicle.year}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      ${vehicle.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.mileage.toLocaleString()} miles
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 