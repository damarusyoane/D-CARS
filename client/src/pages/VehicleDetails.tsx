import { useState, useEffect } from 'react';
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
  CheckCircleIcon,
  PhoneIcon,
  StarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  KeyIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

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
        .eq('profile_id', vehicle?.profile_id)
        .eq('id', vehicle!.profile_id)
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
  useEffect(() => {
    if (isAuthenticated && user && vehicle) {
      const checkIfSaved = async () => {
        const { data, error } = await supabase
          .from('saved_vehicles')
          .select('*')
          .eq('user_id', user.id)
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
        // Remove from saved vehicles
        const { error } = await supabase
          .from('saved_vehicles')
          .delete()
          .eq('user_id', user.id)
          .eq('vehicle_id', vehicle.id);

        if (error) throw error;

        setIsSaved(false);
        toast.success('Vehicle removed from favorites');
      } else {
        // Add to saved vehicles
        const { error } = await supabase
          .from('saved_vehicles')
          .insert({
            user_id: user.id,
            vehicle_id: vehicle.id,
            saved_at: new Date().toISOString()
          });

        if (error) throw error;

        setIsSaved(true);
        toast.success('Vehicle saved to favorites');
      }

      // Invalidate saved vehicles queries
      queryClient.invalidateQueries(['savedVehicles']);
    } catch (err) {
      console.error('Error saving vehicle:', err);
      toast.error('There was a problem saving this vehicle');
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to contact the seller');
      navigate('/login', { state: { from: `/cars/${id}` } });
      return;
    }

    setShowContactForm(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isAuthenticated || !user || !vehicle) {
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: vehicle.profile_id,
          vehicle_id: vehicle.id,
          content: messageText,
          status: 'unread',
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Message sent to seller!');
      setMessageText('');
      setShowContactForm(false);

      // Invalidate messages queries
      queryClient.invalidateQueries(['messages']);
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
        text: `Check out this ${vehicle?.year} ${vehicle?.make} ${vehicle?.model} for $${vehicle?.price?.toLocaleString()}`,
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          <span>Back to search results</span>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-8 h-96">
        {vehicle.images?.[currentImageIndex] && (
          <img
            src={vehicle.images[currentImageIndex]}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
            className="object-cover w-full h-full cursor-pointer"
            onClick={() => setShowFullGallery(true)}
          />
        )}
        {vehicle.images && vehicle.images.length > 1 && (
          <>
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {vehicle.images && vehicle.images.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {currentImageIndex + 1} / {vehicle.images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {vehicle.images && vehicle.images.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 mb-8 pb-2">
          {vehicle.images.map((image, index) => (
            <div 
              key={index} 
              className={`flex-shrink-0 w-24 h-16 rounded-md overflow-hidden cursor-pointer ${currentImageIndex === index ? 'ring-2 ring-primary-600' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img 
                src={image} 
                alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} thumbnail ${index + 1}`}
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
              {vehicle.images?.[currentImageIndex] && (
                <img
                  src={vehicle.images[currentImageIndex]}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>

            <div className="flex justify-between items-center p-4">
              <button
                onClick={handlePreviousImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <div className="text-white">
                {currentImageIndex + 1} / {vehicle.images?.length}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
                aria-label="Next image"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'overview' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'specifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'features' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 relative font-medium text-sm ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          >
            History Report
          </button>
        </nav>
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

            <div className="flex flex-col space-y-2">
              <button
                onClick={handleContactSeller}
                className="w-full flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Message Seller</span>
              </button>
              
              <a 
                href={`tel:${seller?.phone_number || '5555555555'}`}
                className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <PhoneIcon className="w-5 h-5" />
                <span>Call Seller</span>
              </a>
              
              {/* Contact form */}
              {showContactForm && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Send a message about this vehicle
                  </h4>
                  <textarea 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="I'm interested in this vehicle. Is it still available?"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm mb-2"
                    rows={4}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                      className={`flex-1 py-2 px-4 rounded-md text-white text-sm ${messageText.trim() ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      Send Message
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
                <span>{vehicle.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>Listed {new Date(vehicle.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <TagIcon className="w-5 h-5 mr-2" />
                <span>Status: <span className="text-green-600 font-medium capitalize">{vehicle.status}</span></span>
              </div>
              <button
                onClick={shareVehicle}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
                <span>Share Vehicle</span>
              </button>
            </div>
          </div>
          
          {/* Financing Calculator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CurrencyDollarIcon className="w-5 h-5 mr-2 text-primary-600" />
              Estimate Monthly Payment
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vehicle Price: ${calculatorValues.price.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={Math.max(1000, Math.round(vehicle.price * 0.8))} 
                  max={Math.round(vehicle.price * 1.2)} 
                  step={100}
                  value={calculatorValues.price} 
                  onChange={(e) => handleCalculatorChange('price', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Down Payment: ${calculatorValues.downPayment.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={calculatorValues.price * 0.5} 
                  step={100}
                  value={calculatorValues.downPayment} 
                  onChange={(e) => handleCalculatorChange('downPayment', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trade-In Value: ${calculatorValues.tradeInValue.toLocaleString()}
                </label>
                <input 
                  type="range" 
                  min={0} 
                  max={calculatorValues.price * 0.7}
                  step={100} 
                  value={calculatorValues.tradeInValue} 
                  onChange={(e) => handleCalculatorChange('tradeInValue', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Loan Term: {calculatorValues.term} months
                </label>
                <select
                  value={calculatorValues.term}
                  onChange={(e) => handleCalculatorChange('term', Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm"
                >
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                  <option value={60}>60 months</option>
                  <option value={72}>72 months</option>
                  <option value={84}>84 months</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Interest Rate: {calculatorValues.interestRate}%
                </label>
                <input 
                  type="range" 
                  min={1} 
                  max={12} 
                  step={0.1}
                  value={calculatorValues.interestRate} 
                  onChange={(e) => handleCalculatorChange('interestRate', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-md p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Monthly Payment</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                  ${calculateMonthlyPayment().toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-2">This is just an estimate. Contact the seller for accurate financing options.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Similar Vehicles */}
      {similarVehicles && similarVehicles.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Similar Vehicles
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
                      <span className="text-gray-500 dark:text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {similar.year} {similar.make} {similar.model}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                      ${similar.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {similar.mileage?.toLocaleString()} mi
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
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600 mr-2" />
              Vehicle History Report
            </h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center">
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Download Report
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">VIN</span>
                    <span className="font-medium text-gray-900 dark:text-white">1HGBH41JXMN109186</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Year</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Make</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.make}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Model</span>
                    <span className="font-medium text-gray-900 dark:text-white">{vehicle.model}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Title Information</h3>
                <div className="bg-green-50 dark:bg-green-900/10 border-l-4 border-green-400 p-4 mb-4">
                  <div className="flex">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400 mr-3" />
                    <p className="text-green-700 dark:text-green-400">Clean Title</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This vehicle has a clean title, meaning it has not been declared a total loss by an insurance company or been branded with a severe title brand such as salvage, junk, rebuilt, or similar.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Ownership History</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-primary-200 dark:border-primary-900 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-primary-600 rounded-full left-[-7px]"></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">First Owner</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Jan 2018 - Oct 2020 · 2 years, 9 months</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Purchased in {vehicle.location}</p>
                  </div>
                  <div className="border-l-2 border-primary-200 dark:border-primary-900 pl-4 relative">
                    <div className="absolute w-3 h-3 bg-primary-600 rounded-full left-[-7px]"></div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Second Owner</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Oct 2020 - Present · 4 years, 6 months</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Registered in {vehicle.location}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Mileage History</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Jan 2018</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Present</span>
                  </div>
                  <div className="relative h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="absolute left-0 top-0 h-full bg-primary-600" style={{ width: '60%' }}></div>
                    <div className="absolute w-3 h-3 bg-primary-600 rounded-full top-[-2px]" style={{ left: '60%' }}></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">First Record:</span>
                      <span className="font-medium text-gray-900 dark:text-white">5 miles (Jan 2018)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Last Record:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{vehicle.mileage.toLocaleString()} miles (Today)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 