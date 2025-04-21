import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../common/LoadingSpinner';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  condition: string;
  specifications: Record<string, any>;
  features: string[];
  images: string[];
}

interface AvailableVehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
}

export default function CarComparison() {
  const { t } = useTranslation();
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [isSelectingVehicle, setIsSelectingVehicle] = useState(false);

  // Fetch selected vehicles
  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ['comparisonVehicles', selectedVehicles],
    queryFn: async () => {
      if (selectedVehicles.length === 0) return [];

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .in('id', selectedVehicles);

      if (error) throw error;
      return data as Vehicle[];
    },
    enabled: selectedVehicles.length > 0,
  });

  // Fetch available vehicles for selection
  const { data: availableVehicles = [] } = useQuery<AvailableVehicle[]>({
    queryKey: ['availableVehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, title, make, model, year')
        .not('id', 'in', `(${selectedVehicles.join(',')})`)
        .limit(10);

      if (error) throw error;
      return data as AvailableVehicle[];
    },
    enabled: isSelectingVehicle,
  });

  const addVehicle = (vehicleId: string) => {
    if (selectedVehicles.length < 3) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
      setIsSelectingVehicle(false);
    }
  };

  const removeVehicle = (vehicleId: string) => {
    setSelectedVehicles(selectedVehicles.filter((id) => id !== vehicleId));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const specifications = [
    'engine',
    'horsepower',
    'torque',
    'transmission',
    'fuel_type',
    'drive_type',
    'body_type',
    'doors',
    'seats',
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {t('comparison.title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="relative">
                <img
                  src={vehicle.images[0]}
                  alt={vehicle.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {vehicle.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {vehicle.year} • {vehicle.mileage.toLocaleString()} km
              </p>
              <p className="mt-2 text-xl font-semibold text-primary-600">
                ${vehicle.price.toLocaleString()}
              </p>
            </div>
          ))}

          {selectedVehicles.length < 3 && (
            <div className="flex items-center justify-center h-full min-h-[300px] bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <button
                onClick={() => setIsSelectingVehicle(true)}
                className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <PlusIcon className="h-8 w-8 mb-2" />
                <span>{t('comparison.addVehicle')}</span>
              </button>
            </div>
          )}
        </div>

        {isSelectingVehicle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('comparison.selectVehicle')}
                </h3>
              </div>
              <div className="p-4 overflow-y-auto">
                {availableVehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => addVehicle(vehicle.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {vehicle.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setIsSelectingVehicle(false)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {vehicles.length > 1 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('comparison.specifications')}
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {specifications.map((spec) => (
                    <tr key={spec}>
                      <td className="py-3 pl-4 pr-8 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {t(`specifications.${spec}`)}
                      </td>
                      {vehicles.map((vehicle) => (
                        <td
                          key={`${vehicle.id}-${spec}`}
                          className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
                        >
                          {vehicle.specifications[spec] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 