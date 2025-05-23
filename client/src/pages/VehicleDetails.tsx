import { useState, useEffect } from 'react';
import VehicleDetailsAnalytics from './VehicleDetailsAnalytics';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  TagIcon,
  DocumentArrowDownIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface VehicleAnalytics {
  date: string;
  views: number;
  inquiries: number;
}


interface FinanceCalculatorValues {
  price: number;
  downPayment: number;
  term: number;
  interestRate: number;
  tradeInValue: number;
}

const defaultFinanceValues: FinanceCalculatorValues = {
  price: 0,
  downPayment: 0,
  term: 60,
  interestRate: 4.5,
  tradeInValue: 0
};

export default function VehicleDetails() {
  // ...existing state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'features' | 'history'>('overview');
  const [messageText, setMessageText] = useState('');

  // Financing calculator state
  const [calculatorValues, setCalculatorValues] = useState<FinanceCalculatorValues>({
    ...defaultFinanceValues
  });
  const [showFullGallery, setShowFullGallery] = useState(false);

  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery<Vehicle>({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Update financing calculator with vehicle price
      if (data && data.price) {
        setCalculatorValues(prev => ({
          ...prev,
          price: data.price,
          downPayment: Math.round(data.price * 0.1) // Default 10% down payment
        }));
      }

      return data;
    },
  });

  const { data: seller, isLoading: isLoadingSeller } = useQuery<Profile>({
    queryKey: ['seller', vehicle?.profile_id],
    enabled: !!vehicle?.profile_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', vehicle?.profile_id)
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

  // Get similar vehicles based on make, model and price range
  const { data: similarVehicles } = useQuery<Vehicle[]>({
    queryKey: ['similarVehicles', vehicle?.make, vehicle?.model, vehicle?.price],
    enabled: !!vehicle,
    queryFn: async () => {
      if (!vehicle) return [];

      const minPrice = vehicle.price * 0.8; // 20% less than current price
      const maxPrice = vehicle.price * 1.2; // 20% more than current price

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'active')
        .eq('make', vehicle.make)
        .neq('id', vehicle.id) // Exclude current vehicle
        .gte('price', minPrice)
        .lte('price', maxPrice)
        .limit(4);

      if (error) {
        console.error('Error fetching similar vehicles:', error);
        return [];
      }

      return data || [];
    },
  });

  // Check if user has saved this vehicle
  // Increment vehicle views on detail page load
  useEffect(() => {
    const incrementViews = async () => {
      if (vehicle?.id) {
        try {
          await supabase.rpc('increment_vehicle_views', { v_id: vehicle.id });
        } catch (err: unknown) {
          console.error('Error incrementing vehicle views:', err);
        }
      }
    };
    incrementViews();
  }, [vehicle?.id]);

  // Fetch analytics (views/inquiries by day)
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!vehicle?.id) return;
      setAnalyticsLoading(true);
      try {
        // Example: assumes you have a vehicle_analytics_daily table or can group by day
        // If not, this will fallback to total views/inquiries only
        const { data,  } = await supabase
          .from('vehicle_analytics')
          .select('date, views, inquiries')
          .eq('vehicle_id', vehicle.id)
          .order('date', { ascending: true }) as { data: VehicleAnalytics[] | null, error: any };

        let analytics = {
          views: vehicle.views || 0,
          inquiries: vehicle.inquiries || 0,
          dates: [] as string[],
          viewsByDay: [] as number[],
          inquiriesByDay: [] as number[]
        };

        if (data && data.length > 0) {
          analytics.dates = data.map((d: VehicleAnalytics) => d.date);
          analytics.viewsByDay = data.map((d: VehicleAnalytics) => d.views);
          analytics.inquiriesByDay = data.map((d: VehicleAnalytics) => d.inquiries);
          analytics.views = data.reduce((sum: number, d: VehicleAnalytics) => sum + (d.views || 0), 0);
          analytics.inquiries = data.reduce((sum: number, d: VehicleAnalytics) => sum + (d.inquiries || 0), 0);
        }
        setAnalyticsData(analytics);
      } catch (err) {
        setAnalyticsData(null);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, [vehicle?.id, vehicle?.views, vehicle?.inquiries]);

  useEffect(() => {
    if (isAuthenticated && user && vehicle) {
      const checkIfSaved = async () => {
        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('profile_id', user.id)
          .eq('vehicle_id', vehicle.id)
          .single();

        if (!error && data) {
          setIsSaved(true);
        }
      };

      checkIfSaved();
    }
  }, [isAuthenticated, user, vehicle]);

  const handleSaveVehicle = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save vehicles');
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    if (!user || !vehicle) return;

    try {
      if (isSaved) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('profile_id', user.id)
          .eq('vehicle_id', vehicle.id);

        if (error) throw error;

        setIsSaved(false);
        toast.success('Vehicule supprimer des favoris');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            profile_id: user.id,
            vehicle_id: vehicle.id,
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        setIsSaved(true);
        toast.success('Vehicule ajouter aux favoris');
      }

      // Invalidate saved vehicles queries
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } catch (err) {
      console.error('Error updating favorites:', err);
      toast.error('Un problème est survenu lors de la mise à jour de vos favoris');
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour contacter le vendeur');
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    setShowContactForm(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isAuthenticated || !user || !vehicle) {
      toast.error("Impossible d'envoyer le message: informations requises manquantes.");
      return;
    }
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: vehicle.profile_id,
          vehicle_id: vehicle.id,
          content: messageText,
          status: 'unread',
          created_at: new Date().toISOString()
        });
      if (error) throw error;

      // Increment inquiries count after successful message send
      try {
        await supabase.rpc('increment_vehicle_inquiries', { v_id: vehicle.id });
      } catch (rpcErr) {
        console.error('Failed to increment vehicle inquiries:', rpcErr);
      }

      toast.success('Message envoyé au vendeur !');
      setMessageText('');
      setShowContactForm(false);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message. Please try again.');
    }
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const { price, downPayment, term, interestRate, tradeInValue } = calculatorValues;
    const loanAmount = price - downPayment - tradeInValue;

    if (loanAmount <= 0) return 0;

    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);

    return Math.round(monthlyPayment);
  };

  const handleCalculatorChange = (field: keyof FinanceCalculatorValues, value: number) => {
    setCalculatorValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const shareVehicle = () => {
    if (navigator.share) {
      navigator.share({
        title: `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`,
        text: `Regarde ceci ${vehicle?.year} ${vehicle?.make} ${vehicle?.model} pour XAF${vehicle?.price?.toLocaleString()}`,
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support native sharing
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoadingVehicle || isLoadingSeller) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Back Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span>Retour aux résultats de recherche</span>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-6 h-60 sm:h-80 md:h-96">
        {vehicle?.images?.[currentImageIndex] && (
          <img
            src={vehicle?.images?.[currentImageIndex]}
            alt={`${vehicle?.year ?? ''} ${vehicle?.make ?? ''} ${vehicle?.model ?? ''} - Image ${currentImageIndex + 1}`}
            className="object-cover w-full h-full cursor-pointer"
            onClick={() => setShowFullGallery(true)}
          />
        )}
        {vehicle?.images && vehicle.images.length > 1 && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {vehicle?.images && vehicle.images.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {vehicle?.images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {vehicle?.images && vehicle.images.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {vehicle.images.map((image, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 w-20 h-12 sm:w-24 sm:h-16 rounded-md overflow-hidden cursor-pointer ${currentImageIndex === index ? 'ring-2 ring-primary-600' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img 
                src={image} 
                alt={`${vehicle?.year ?? 'N/A'} ${vehicle?.make ?? 'N/A'} ${vehicle?.model ?? 'N/A'} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Full Gallery Modal */}
      {showFullGallery && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setShowFullGallery(false)}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                aria-label="Close gallery"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
              {vehicle?.images?.[currentImageIndex] && (
                <img
                  src={vehicle?.images?.[currentImageIndex]}
                  alt={`${vehicle?.year ?? 'N/A'} ${vehicle?.make ?? 'N/A'} ${vehicle?.model ?? 'N/A'} - Image ${currentImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex justify-between items-center p-4">
              <button
                onClick={handlePreviousImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                aria-label="Image précédente"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <div className="text-white">
                {currentImageIndex + 1} / {vehicle?.images?.length}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                aria-label="Image suivante"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex flex-wrap gap-2 sm:space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full sm:w-auto py-2 px-2 sm:py-4 sm:px-1 relative font-medium text-sm ${activeTab === 'overview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`w-full sm:w-auto py-2 px-2 sm:py-4 sm:px-1 relative font-medium text-sm ${activeTab === 'specifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Spécifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`w-full sm:w-auto py-2 px-2 sm:py-4 sm:px-1 relative font-medium text-sm ${activeTab === 'features' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Caractéristiques
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full sm:w-auto py-2 px-2 sm:py-4 sm:px-1 relative font-medium text-sm ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Historique du Véhicule
          </button>
        </nav>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {[vehicle?.year, vehicle?.make, vehicle?.model].filter(Boolean).join(' ')}
              </h1>
              <p className="mt-2 text-lg sm:text-xl font-semibold text-primary-600 dark:text-primary-400">
                XAF {vehicle?.price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleSaveVehicle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 self-start"
            >
              {isSaved ? (
                <HeartIconSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Vehicle Details */}
          {vehicle && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { label: 'Marque', value: vehicle.make },
                  { label: 'Modèle', value: vehicle.model },
                  { label: 'Année', value: vehicle.year },
                  { label: 'Kilométrage', value: vehicle.mileage ? `${vehicle.mileage?.toLocaleString?.()} km` : 'N/D' },
                ].map((detail) => (
                  <div
                    key={detail.label}
                    className="bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-lg"
                  >
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {detail.label}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line overflow-y-auto">
                  {vehicle.description}
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Caractéristiques
                </h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                  {vehicle.features?.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center text-gray-600 dark:text-gray-300 text-xs sm:text-base"
                    >
                      <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Spécifications
                </h2>
                {vehicle && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    {Object.entries(vehicle.specifications ?? {}).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 text-xs sm:text-base"
                      >
                        <span className="text-gray-600 dark:text-gray-300 capitalize">
                          {key.replace(/([A-Z])/g, ' XAF').trim()}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div> )}{/* End Main Content */}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <Link
                to={seller?.id ? `/seller/${seller.id}` : '#'}
                className="mx-auto sm:mx-0 h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-600 flex-shrink-0 border-2 border-primary-200 dark:border-primary-700"
                tabIndex={seller?.id ? 0 : -1}
                aria-label={seller?.full_name ? `Voir le profil de ${seller.full_name}` : 'Voir le profil du vendeur'}
              >
                {seller?.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={seller.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl text-gray-400 dark:text-gray-500">
                    ?
                  </div>
                )}
              </Link>
              <div className="flex flex-col items-center sm:items-start flex-1">
                <span className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                  {seller?.full_name}
                  {seller?.role === 'seller' && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs align-middle">Vendeur</span>
                  )}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Membre depuis {seller?.created_at ? new Date(seller.created_at).getFullYear() : '—'}
                </span>
                <Link
                  to={seller?.id ? `/seller/${seller.id}` : '#'}
                  className="inline-block mt-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 transition-colors"
                  tabIndex={seller?.id ? 0 : -1}
                  aria-label={seller?.full_name ? `Allez au profil de ${seller.full_name}` : 'Allez au profil du vendeur'}
                >
                  Voir le profil du vendeur
                </Link>
              </div>
            </div>
            
            {vehicle && (
              <ul className="grid grid-cols-2 gap-2">
                {vehicle.features?.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center text-gray-600 dark:text-gray-300"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Specifications */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Specifications
            </h2>
            {vehicle && (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(vehicle.specifications ?? {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-gray-600 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' XAF').trim()}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div> {/* End Sidebar */}
        </div> {/* End grid container */}

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Seller Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                {seller?.avatar_url && (
                  <img
                    src={seller.avatar_url}
                    alt={seller.full_name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {seller?.full_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Membre depuis {new Date(seller?.created_at ?? '').getFullYear()}
                </p>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={handleContactSeller}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Contacter le vendeur</span>
              </button>
              
              <a 
                href={`tel:${seller?.phone_number || '5555555555'}`}
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>Appeler le vendeur</span>
              </a>
              
              {/* Contact form */}
              {showContactForm && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Envoyer un message concernant ce véhicule
                  </h4>
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Je suis intéressé(e) par ce véhicule. Est-il toujours disponible ?"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm mb-2"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 text-sm"
                    >
                      Annuler
                    </button>
                    <button
  onClick={handleSendMessage}
  disabled={!messageText.trim()}
  aria-label="Send message to seller"
  className={`flex-1 py-2 px-4 rounded-md text-white text-sm ${messageText.trim() ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
>
  Envoyer un Message 
</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{vehicle?.location || 'Localisation pas specifier'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>Annonce {vehicle?.created_at ? new Date(vehicle.created_at).toLocaleDateString() : 'Date non specifier'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <TagIcon className="w-5 h-5 mr-2" />
                <span>Status: <span className="text-green-600 font-medium capitalize">{vehicle?.status || 'Inconnus'}</span></span>
              </div>
              <button
                onClick={shareVehicle}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Partager l'annonce</span>
              </button>
            </div>
          </div>
          
          {/* Financing Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-primary-600" />
            Calculer le montant mensuel
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                 Prix du vehicule: XAF{calculatorValues.price.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={Math.max(1000, Math.round((vehicle?.price ?? 10000) * 0.8))} 
                  max={Math.round((vehicle?.price ?? 10000) * 1.2)} 
                  step={100}
                  value={calculatorValues.price} 
                  onChange={(e) => handleCalculatorChange('price', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  title="Vehicle Price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payement Echoneler: XAF{calculatorValues.downPayment.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={calculatorValues.price * 0.5} 
                  step={100}
                  value={calculatorValues.downPayment} 
                  onChange={(e) => handleCalculatorChange('downPayment', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  title="Down Payment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valeur au marcher:XAF{calculatorValues.tradeInValue.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={calculatorValues.price * 0.7}
                  step={100} 
                  value={calculatorValues.tradeInValue} 
                  onChange={(e) => handleCalculatorChange('tradeInValue', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  title="Trade-In Value"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pret: {calculatorValues.term} mois
                </label>
                <select
                  value={calculatorValues.term}
                  onChange={(e) => handleCalculatorChange('term', Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                  title="Loan Term"
                >
                  <option value={24}>24 mois</option>
                  <option value={36}>36 mois</option>
                  <option value={48}>48 mois</option>
                  <option value={60}>60 mois</option>
                  <option value={72}>72 mois</option>
                  <option value={84}>84 mois</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interet: {calculatorValues.interestRate}%
                </label>
                <input 
                  type="range" 
                  min={1} 
                  max={12} 
                  step={0.1}
                  value={calculatorValues.interestRate} 
                  onChange={(e) => handleCalculatorChange('interestRate', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  title="Interest Rate"
                />
              </div>
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-md p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Payement par mois estimer</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                  XAF{calculateMonthlyPayment().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">C'est juste une estimation. Contactez le vendeur pour des options de financement exactes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar Vehicles */}
      {Array.isArray(similarVehicles) && similarVehicles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
             Vehicule Similaire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVehicles.map((similar) => (
              <Link
                key={similar.id}
                to={`/cars/${similar.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  {similar.images && similar.images[0] ? (
                    <img
                      src={similar.images[0]}
                      alt={`${similar.year} ${similar.make} ${similar.model}`}
                      className="object-cover w-full h-48"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-car.jpg';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-300 dark:bg-gray-700">
                      <span className="text-gray-500 dark:text-gray-400">Pas d'image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {[similar?.year, similar?.make, similar?.model].filter(Boolean).join(' ')}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      XAF{similar?.price?.toLocaleString?.() ?? 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {similar?.mileage?.toLocaleString?.() ?? 'N/A'} km
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Vehicle History Report */}
      {activeTab === 'history' && (
        <><div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600 mr-2" />
              Rapport d'histoire du vehicule
            </h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center">
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Telecharger le rapport
            </button>
          </div>

          {analyticsLoading ? (
  <div className="flex justify-center my-8"><LoadingSpinner size="md" /></div>
) : analyticsData ? (
  <VehicleDetailsAnalytics analytics={analyticsData} />
) : null}

<div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-6">
            </div>
          </div>
        </div><div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Information du titre</h3>
            <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
                <p className="text-green-700 dark:text-green-400">Titre propre</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
            Ce vehicule a un titre propre, ce qui signifie qu'il n'a pas ete declare a un total loss par une compagnie d'assurance ou marque avec une gravure de titre sevère telle que salvage, junk, rebuilt, ou similaire.
            </p>
          </div><div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Histoire du proprietaire</h3>
            <div className="space-y-4">
              <div className="border-l-2 border-primary-200 dark:border-primary-900 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary-600 rounded-full left-[-7px]"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Premier proprietaire</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jan 2018 - Oct 2020 · 2 ans, 9 mois</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Acheter en {vehicle?.location ?? 'N/A'}</p>
              </div>
              <div className="border-l-2 border-primary-200 dark:border-primary-900 pl-4 relative">
                <div className="absolute w-3 h-3 bg-primary-600 rounded-full left-[-7px]"></div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Deuxieme proprietaire</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Oct 2020 - Present · 4 ans, 6 mois</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Enregistrer en {vehicle?.location ?? 'N/A'}</p>
              </div>
            </div>
          </div><div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Historique du kilometrage</h3>
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Jan 2018</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Present</span>
              </div>
              <div className="relative h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-primary-600 w-[60%]"></div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Premier enregistrement:</span>
                  <span className="font-medium text-gray-900 dark:text-white">5 kilometres (Jan 2018)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Dernier enregistrement:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{vehicle?.mileage?.toLocaleString?.() ?? 'N/A'} kilometres (Aujourd'hui)</span>
                </div>
              </div>
            </div>
          </div></>
        )}
   </>
    )
  }
