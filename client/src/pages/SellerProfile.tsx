import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useSessionAwareRefresh } from '../hooks/useSessionAwareRefresh';
import { Database } from '../types/database';
import LoadingSpinner from '../components/common/LoadingSpinner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];

const SellerProfile = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const navigate = useNavigate();

  // Fetch profile (seller) by id
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile
  } = useQuery<Profile | null>({
    queryKey: ['profile', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sellerId)
        .single();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!sellerId
  });

  // Fetch vehicles for this profile
  const {
    data: vehicles,
    isLoading: isLoadingVehicles,
    refetch: refetchVehicles
  } = useQuery<any[]>({
    queryKey: ['vehicles', sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('seller_id', sellerId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!sellerId
  });

  // Session-aware refresh
  useSessionAwareRefresh(() => {
    refetchProfile();
    refetchVehicles();
  });

  if (isLoadingProfile || isLoadingVehicles) {
    return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!profile) {
    return <div className="text-center mt-10">Profile not found.</div>;
  }

  // Type assertion for lint-free property access
  const userProfile = profile as unknown as Profile;

  // Ensure vehicles is always an array
  const profileVehicles: Vehicle[] = Array.isArray(vehicles) ? vehicles : [];

  // Only allow seller or dealer roles
  const isSellerOrDealer = (userProfile.role === 'seller');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        className="mb-6 flex items-center text-primary-600 hover:text-primary-800"
        onClick={() => navigate(-1)}
      >
        &larr; Back
      </button>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <div className="flex-shrink-0 h-28 w-28 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {userProfile.avatar_url ? (
            <img src={userProfile.avatar_url} alt={userProfile.full_name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-3xl text-gray-400 dark:text-gray-500">
              ?
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{userProfile.full_name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{userProfile.email}</p>
          {userProfile.phone_number && <p className="text-gray-600 dark:text-gray-300 mb-2">Phone: {userProfile.phone_number}</p>}
          {/* Add more profile info here if needed */}
        </div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Vehicles for Sale or Rent</h2>
      {isSellerOrDealer ? (
        profileVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {profileVehicles.map((vehicle) => (
              <Link
                to={`/cars/${vehicle.id}`}
                key={vehicle.id}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                {Array.isArray(vehicle.images) && vehicle.images.length > 0 && (
                  <img
                    src={vehicle.images[0]}
                    alt={vehicle.make + ' ' + vehicle.model}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{vehicle.make} {vehicle.model}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{vehicle.year} &bull; {vehicle.specifications?.transmission} &bull; {vehicle.specifications?.fuel_type}</p>
                  <p className="text-gray-700 dark:text-gray-200 mb-1">{vehicle.status === 'pending' ? 'Pending' : vehicle.status === 'sold' ? 'Sold' : 'For Sale'}</p>
                  <p className="text-primary-600 font-semibold text-xl">${vehicle.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No vehicles currently listed by this profile.</div>
        )
      ) : (
        <div className="text-gray-500 dark:text-gray-400">This user is not a seller or dealer.</div>
      )}
    </div>
  );
};

export default SellerProfile;
