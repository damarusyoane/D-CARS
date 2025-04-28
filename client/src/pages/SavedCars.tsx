import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { useSessionAwareRefresh } from '../hooks/useSessionAwareRefresh';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  HeartIcon,
  FunnelIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

export default function SavedCars() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">{t('auth.pleaseLogin', 'Please log in to view this page.')}</p>
      </div>
    );
  }

  const [filters] = useState({
    priceRange: [0, 1000000],
    yearRange: [1990, new Date().getFullYear()],
    condition: 'all',
    transmission: 'all',
    fuelType: 'all',
  });
  const [sortBy,] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch saved vehicles
  const { data: savedVehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ['savedVehicles', user?.id, filters, sortBy, sortOrder],
    queryFn: async () => {
      const { data: saved, error: savedError } = await supabase
        .from('saved_vehicles')
        .select('vehicle_id')
        .eq('user_id', user?.id);

      if (savedError) throw savedError;

      const vehicleIds = saved.map((s) => s.vehicle_id);

      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', vehicleIds)
        .gte('price', filters.priceRange[0])
        .lte('price', filters.priceRange[1])
        .gte('year', filters.yearRange[0])
        .lte('year', filters.yearRange[1])
        .order(sortBy, { ascending: sortOrder === 'asc' });

      if (vehiclesError) throw vehiclesError;

      if (filters.condition !== 'all') {
        return vehicles.filter((v) => v.condition === filters.condition);
      }

      if (filters.transmission !== 'all') {
        return vehicles.filter((v) => v.transmission === filters.transmission);
      }

      if (filters.fuelType !== 'all') {
        return vehicles.filter((v) => v.fuel_type === filters.fuelType);
      }

      return vehicles;
    },
    enabled: !!user?.id,
  });

  // Remove from saved vehicles
  const removeFromSaved = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from('saved_vehicles')
        .delete()
        .eq('user_id', user?.id)
        .eq('vehicle_id', vehicleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedVehicles', user?.id] });
      toast.success(t('savedCars.removed'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('savedCars.title')}
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ChevronDownIcon
                className={`h-5 w-5 mr-2 ${
                  sortOrder === 'asc' ? 'rotate-180' : ''
                }`}
              />
              {t('common.sort')}
            </button>
            <button className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <FunnelIcon className="h-5 w-5 mr-2" />
              {t('common.filter')}
            </button>
          </div>
        </div>

        {savedVehicles?.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {t('savedCars.empty')}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('savedCars.emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedVehicles?.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={vehicle.images?.[0]}
                    alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    title="Remove from saved"
                    onClick={() => removeFromSaved.mutate(vehicle.id)}
                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HeartIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {vehicle.year} • {vehicle.mileage.toLocaleString()} km
                  </p>
                  <p className="mt-2 text-lg font-semibold text-primary-600">
                    ${vehicle.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}