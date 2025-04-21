import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: seller, isLoading: isLoadingSeller } = useQuery<Profile>({
    queryKey: ['seller', vehicle?.seller_id],
    enabled: !!vehicle?.seller_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vehicle!.seller_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (vehicle?.images?.length ?? 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (vehicle?.images?.length ?? 1) - 1 ? 0 : prev + 1
    );
  };

  const handleSaveVehicle = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    setIsSaved((prev) => !prev);
    // Implement save functionality
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }
    navigate(`/messages?vehicle=${id}`);
  };

  if (isLoadingVehicle || isLoadingSeller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Vehicle not found
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-8">
        {vehicle.images?.[currentImageIndex] && (
          <img
            src={vehicle.images[currentImageIndex]}
            alt={`${vehicle.title} - Image ${currentImageIndex + 1}`}
            className="object-cover w-full h-full"
          />
        )}
        {vehicle.images && vehicle.images.length > 1 && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {vehicle.title}
              </h1>
              <p className="mt-2 text-xl font-semibold text-primary-600 dark:text-primary-400">
                ${vehicle.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleSaveVehicle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSaved ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Make', value: vehicle.make },
              { label: 'Model', value: vehicle.model },
              { label: 'Year', value: vehicle.year },
              { label: 'Mileage', value: `${vehicle.mileage.toLocaleString()} miles` },
            ].map((detail) => (
              <div
                key={detail.label}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {detail.label}
                </p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Description
            </h2>
            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Features
            </h2>
            <ul className="grid grid-cols-2 gap-2">
              {vehicle.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center text-gray-600 dark:text-gray-300"
                >
                  <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Specifications
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(vehicle.specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                >
                  <span className="text-gray-600 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {seller?.avatar_url && (
                  <img
                    src={seller.avatar_url}
                    alt={seller.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {seller?.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(seller?.created_at ?? '').getFullYear()}
                </p>
              </div>
            </div>

            <button
              onClick={handleContactSeller}
              className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Contact Seller</span>
            </button>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>Location information</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>Listed {new Date(vehicle.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 