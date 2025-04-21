import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  TrashIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  LockClosedIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface CartItem {
  id: string;
  user_id: string;
  item_type: 'subscription' | 'feature' | 'service';
  plan_id?: string;
  plan_slug?: string;
  feature_id?: string;
  feature_slug?: string;
  service_slug?: string;
  vehicle_id?: string;
  billing_period?: 'monthly' | 'yearly';
  price: number;
  quantity: number;
  title: string;
  description: string;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
}

interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
}

export default function Cart() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for checkout
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Store subscription plans, features, and services
  const [subscriptionPlans, setSubscriptionPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [features, setFeatures] = useState<Record<string, Feature>>({});
  const [services, setServices] = useState<Record<string, Service>>({});
  
  useEffect(() => {
    if (user) {
      // Load reference data first, then fetch cart items
      Promise.all([
        fetchSubscriptionPlans(),
        fetchFeatures(),
        fetchServices()
      ]).then(() => {
        fetchCartItems();
      });
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      const planMap: Record<string, SubscriptionPlan> = {};
      (data || []).forEach(plan => {
        planMap[plan.slug] = plan;
      });
      
      setSubscriptionPlans(planMap);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };
  
  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      const featureMap: Record<string, Feature> = {};
      (data || []).forEach(feature => {
        featureMap[feature.slug] = feature;
      });
      
      setFeatures(featureMap);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };
  
  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      const serviceMap: Record<string, Service> = {};
      (data || []).forEach(service => {
        serviceMap[service.slug] = service;
      });
      
      setServices(serviceMap);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };
  
  const fetchCartItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get cart items from database
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Enhanced cart items with additional info
      const enhancedItems: CartItem[] = [];
      for (const item of data || []) {
        let title = t('cart.unknownItem');
        let description = '';
        let price = 0;
        
        // Fetch additional details based on item type
        if (item.item_type === 'subscription') {
          const plan = item.plan_slug ? subscriptionPlans[item.plan_slug] : null;
          
          if (plan) {
            title = plan.name;
            description = `${plan.description} (${item.billing_period === 'yearly' ? t('subscription.yearly') : t('subscription.monthly')})`;            
            price = item.billing_period === 'yearly' ? plan.yearly_price : plan.monthly_price;
          }
        } else if (item.item_type === 'feature') {
          const feature = item.feature_slug ? features[item.feature_slug] : null;
          
          if (feature) {
            title = feature.name;
            description = feature.description;
            price = feature.price;
          }
        } else if (item.item_type === 'service') {
          const service = item.service_slug ? services[item.service_slug] : null;
          
          if (service) {
            title = service.name;
            description = service.description;
            price = service.price;
          }
        }
        
        enhancedItems.push({
          ...item,
          title,
          description,
          price
        });
      }
      
      setCartItems(enhancedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError(t('cart.errorFetching'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveItem = async (itemId: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.success(t('cart.itemRemoved'));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(t('common.error'));
    }
  };
  
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTaxes = () => {
    return calculateTotal() * 0.18; // 18% tax rate
  };
  
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      toast.error(t('errors.required'));
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real app, you'd send payment info to a payment processor
      // Here we'll just simulate a successful payment
      
      // 1. Create transaction record
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: totalAmount,
          status: 'completed',
          payment_method: 'credit_card',
          created_at: new Date().toISOString()
        });
        
      if (transactionError) throw transactionError;
      
      // 2. Process each cart item
      for (const item of cartItems) {
        // Process based on item type
        if (item.item_type === 'subscription') {
          // Calculate end date based on billing period
          const startDate = new Date();
          const endDate = new Date(startDate);
          if (item.billing_period === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
          } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
          }
          
          // Create or update subscription
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: user?.id,
              plan_type: item.plan_slug,
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: endDate.toISOString(),
              payment_status: 'paid',
              auto_renew: true
            });
            
          if (error) throw error;
        } else if (item.item_type === 'feature' && item.vehicle_id) {
          // Apply feature to vehicle
          // This would depend on your specific feature implementation
          console.log(`Feature ${item.feature_slug} applied to vehicle ${item.vehicle_id}`);
        } else if (item.item_type === 'service') {
          // Process service
          // This would depend on your specific service implementation
          console.log(`Service ${item.service_slug} processed`);
        }
      }
      
      // 3. Clear cart
      const { error: clearCartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user?.id);
        
      if (clearCartError) throw clearCartError;
      
      // 4. Show success message and clear form
      setCartItems([]);
      setCardNumber('');
      setCardHolder('');
      setExpiryDate('');
      setCvv('');
      
      toast.success(t('cart.paymentSuccess'));
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(t('cart.errorProcessing'));
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
        <LoadingSpinner />
        <p className="ml-2">{t('common.loading')}...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
        <ExclamationCircleIcon className="h-16 w-16 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t('auth.signIn')}</h1>
        <p className="text-gray-300 mb-6 text-center">{t('cart.signInRequired')}</p>
        <Link
          to="/login"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('auth.signIn')}
        </Link>
      </div>
    );
  }
  
  if (cartItems.length === 0 && !error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
        <ShoppingCartIcon className="h-16 w-16 text-gray-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t('cart.empty')}</h1>
        <p className="text-gray-300 mb-6 text-center">{t('cart.emptyDesc')}</p>
        <Link
          to="/subscription"
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('cart.continueShopping')}
        </Link>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-900 text-white p-4">
        <ExclamationCircleIcon className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">{t('common.error')}</h1>
        <p className="text-gray-300 mb-6 text-center">{error}</p>
        <button
          onClick={() => fetchCartItems()}
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          {t('common.retry')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-10 text-center">{t('cart.title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-gray-400 mt-1">{item.description}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-gray-300 mr-4">{t('common.quantity')}: {item.quantity}</span>
                    <span className="font-semibold">{t('common.currency')} {item.price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                    aria-label="Remove item"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">{t('cart.orderSummary')}</h2>
              
              <div className="space-y-2 pb-4 border-b border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-300">{t('cart.subtotal')}</span>
                  <span>{t('common.currency')} {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{t('cart.taxes')}</span>
                  <span>{t('common.currency')} {calculateTaxes().toLocaleString('fr-FR', { minimumFractionDigits: 0 })}</span>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 text-xl font-bold">
                <span>{t('common.total')}</span>
                <span>{t('common.currency')} {(calculateTotal() + calculateTaxes()).toLocaleString('fr-FR', { minimumFractionDigits: 0 })}</span>
              </div>
              
              <form onSubmit={handleCheckout} className="mt-6 space-y-4">
                <h3 className="font-semibold border-b border-gray-700 pb-2">{t('cart.paymentInfo')}</h3>
                
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-300 mb-1">
                    {t('cart.cardNumber')}
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-300 mb-1">
                    {t('cart.cardHolder')}
                  </label>
                  <input
                    type="text"
                    id="cardHolder"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-300 mb-1">
                      {t('cart.expiryDate')}
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-300 mb-1">
                      {t('cart.cvv')}
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white"
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center"
                  >
                    {isProcessing ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{t('cart.paymentProcessing')}</span>
                      </>
                    ) : (
                      <>
                        <LockClosedIcon className="h-5 w-5 mr-2" />
                        {t('cart.completeOrder')}
                      </>
                    )}
                  </button>
                </div>
                
                <div className="flex items-center justify-center text-sm text-gray-400 mt-4">
                  <LockClosedIcon className="h-4 w-4 mr-1 text-green-500" />
                  <span>{t('cart.securePayment')}</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
