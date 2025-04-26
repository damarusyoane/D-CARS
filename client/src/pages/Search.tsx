import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import {
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ArrowTopRightOnSquareIcon
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
  status: string[];
}

const initialFilters: Filters = {
  priceRange: [0, 1000000],
  yearRange: [1990, new Date().getFullYear()],
  mileageRange: [0, 500000],
  make: [],
  model: [],
  transmission: [],
  fuelType: [],
  status: ['active']
};

export default function Search() {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'newest' | 'mileage_asc'>('newest');

  // Get available makes and models for filters
  const [availableMakes, setAvailableMakes] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all available makes
    const fetchMakes = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('make')
        .eq('status', 'active')
        .order('make');
      
      if (!error && data) {
        // Extract unique makes
        const makes = [...new Set(data.map(v => v.make))].filter(Boolean);
        setAvailableMakes(makes);
      }
    };
    
    fetchMakes();
  }, []);

  // Update models when makes filter changes
  useEffect(() => {
    const fetchModels = async () => {
      if (filters.make.length === 0) {
        // If no makes selected, get all models
        const { data, error } = await supabase
          .from('vehicles')
          .select('model')
          .eq('status', 'active')
          .order('model');
        
        if (!error && data) {
          const models = [...new Set(data.map(v => v.model))].filter(Boolean);
          setAvailableModels(models);
        }
      } else {
        // Get models for selected makes
        const { data, error } = await supabase
          .from('vehicles')
          .select('model')
          .eq('status', 'active')
          .in('make', filters.make)
          .order('model');
        
        if (!error && data) {
          const models = [...new Set(data.map(v => v.model))].filter(Boolean);
          setAvailableModels(models);
        }
      }
    };
    
    fetchModels();
  }, [filters.make]);

  const { data: vehicles, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ['vehicles', filters, sortBy, searchQuery],
    queryFn: async () => {
      console.log('Fetching vehicles with filters:', filters);
      
      let query = supabase
        .from('vehicles')
        .select('*')
        .in('status', filters.status) // Use 'active' instead of 'available'
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
        .gte('year', filters.yearRange[0])
        .lte('year', filters.yearRange[1])
        .gte('mileage', filters.mileageRange[0])
        .lte('mileage', filters.mileageRange[1]);

      if (filters.make.length > 0) {
        query = query.in('make', filters.make);
      }
      
      if (filters.model.length > 0) {
        query = query.in('model', filters.model);
      }

      if (searchQuery) {
        // Search in make, model, and description
        query = query.or(
          `make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
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
      if (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
      }
      console.log('Fetched vehicles:', data);
      return data || [];
    },
    staleTime: 60000, // 1 minute
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
              aria-label="Close filters"
              title="Close filters"
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

          {/* Make */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Make</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {availableMakes.length > 0 ? (
                availableMakes.map((make) => (
                  <div key={make} className="flex items-center">
                    <input
                      id={`make-${make}`}
                      type="checkbox"
                      checked={filters.make.includes(make)}
                      onChange={() => {
                        setFilters({
                          ...filters,
                          make: filters.make.includes(make)
                            ? filters.make.filter(m => m !== make)
                            : [...filters.make, make]
                        });
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`make-${make}`} className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {make}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No makes available</p>
              )}
            </div>
          </div>

          {/* Model */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Model</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <div key={model} className="flex items-center">
                    <input
                      id={`model-${model}`}
                      type="checkbox"
                      checked={filters.model.includes(model)}
                      onChange={() => {
                        setFilters({
                          ...filters,
                          model: filters.model.includes(model)
                            ? filters.model.filter(m => m !== model)
                            : [...filters.model, model]
                        });
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`model-${model}`} className="ml-2 block text-sm text-gray-900 dark:text-white">
                      {model}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No models available</p>
              )}
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
                aria-label="Sort vehicles"
                title="Sort vehicles"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage_asc">Lowest Mileage</option>
              </select>
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Open filters"
                title="Open filters"
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error loading vehicles. Please try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        ) : vehicles?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No vehicles found matching your criteria.</p>
            <button 
              onClick={() => setFilters(initialFilters)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {vehicles?.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  {vehicle.images && vehicle.images[0] ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="object-cover w-full h-56"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-car.jpg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-300 dark:bg-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-xl">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.location || 'Location not specified'}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      ${vehicle.price?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.mileage?.toLocaleString() || '0'} miles
                    </p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {vehicle.condition || 'Used'}
                    </span>
                    <Link
                      to={`/cars/${vehicle.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                    >
                      View Details
                      <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                    </Link>
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