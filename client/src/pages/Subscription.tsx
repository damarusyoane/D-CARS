import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  CheckIcon,
  XMarkIcon,
  ShoppingCartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: Record<string, boolean>;
  listings_allowed: number;
  featured_listings: number;
  analytics_access: boolean;
  priority_support: boolean;
  is_active: boolean;
}

export default function Subscription() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSubscriptionPlans();
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);
  
  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('monthly_price', { ascending: true });
        
      if (error) throw error;
      
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchCurrentSubscription = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('profile_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setCurrentSubscription(data.plan_type);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };
  
  const handleSelectPlan = async (planSlug: string) => {
    if (!user) {
      toast.error(t('auth.signIn'));
      navigate('/login', { state: { redirect: '/subscription' } });
      return;
    }
    
    // For free plan, directly update the subscription
    if (planSlug === 'free') {
      try {
        setProcessingPlan(planSlug);
        
        // Check if user already has an active subscription
        const { data: existingSub, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('profile_id', user.id)
          .eq('status', 'active')
          .single();
          
        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }
        
        // If existing subscription, update it to free plan
        if (existingSub) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              plan_type: 'free',
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingSub.id);
            
          if (error) throw error;
        } else {
          // Create new free subscription
          const { error } = await supabase
            .from('subscriptions')
            .insert({
              profile_id: user.id,
              plan_type: 'free',
              status: 'active',
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
              payment_status: 'paid',
              auto_renew: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (error) throw error;
        }
        
        setCurrentSubscription('free');
        toast.success(t('subscription.freePlanSuccess'));
      } catch (error) {
        console.error('Error updating subscription:', error);
        toast.error(t('common.error'));
      } finally {
        setProcessingPlan(null);
      }
    } else {
      // For paid plans, add to cart
      try {
        setProcessingPlan(planSlug);
        
        // Add subscription plan to cart
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            item_type: 'subscription',
            plan_slug: planSlug,
            billing_period: billingPeriod,
            quantity: 1,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        toast.success(t('subscription.addedToCart'));
        navigate('/cart');
      } catch (error) {
        console.error('Error adding plan to cart:', error);
        toast.error(t('common.error'));
      } finally {
        setProcessingPlan(null);
      }
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
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 inline-block p-2 bg-blue-500/20 rounded-full">
            <SparklesIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('subscription.title')}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('subscription.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-10 inline-flex items-center bg-gray-800 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md ${billingPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              {t('subscription.monthly')}
            </button>
            <button
              className={`px-4 py-2 rounded-md ${billingPeriod === 'yearly' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              {t('subscription.yearly')} <span className="text-sm text-green-400">{t('subscription.savePercent')}</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const price = billingPeriod === 'yearly' ? plan.yearly_price : plan.monthly_price;
            const isCurrentPlan = currentSubscription === plan.slug;
            const featuresArray = Object.entries(plan.features || {}).map(([key, value]) => ({
              name: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              included: value
            }));
            
            return (
              <div 
                key={plan.id}
                className={`rounded-xl overflow-hidden ${plan.slug === 'premium' ? 'border-2 border-blue-500 relative' : 'border border-gray-700'}`}
              >
                {plan.slug === 'premium' && (
                  <div className="absolute top-0 inset-x-0 bg-blue-600 text-white text-sm font-medium text-center py-1">
                    {t('subscription.mostPopular')}
                  </div>
                )}
                <div className="bg-gray-800 p-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      <p className="text-gray-400 mt-1">{plan.description}</p>
                    </div>
                    {plan.slug === 'premium' ? (
                      <RocketLaunchIcon className="h-8 w-8 text-blue-400" />
                    ) : plan.slug === 'standard' ? (
                      <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
                    ) : (
                      <SparklesIcon className="h-8 w-8 text-blue-400" />
                    )}
                  </div>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{t('common.currency')} {price.toLocaleString('fr-FR', { style: 'currency', currency: 'XAF' })}</span>
                    <span className="text-gray-400 ml-2">{billingPeriod === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear')}</span>
                  </div>
                </div>
                <div className="bg-gray-900 p-8">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      <span>{plan.listings_allowed} {t('subscription.listings')}</span>
                    </li>
                    <li className="flex items-start">
                      <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      <span>{plan.featured_listings} {t('subscription.featuredListings')}</span>
                    </li>
                    <li className="flex items-start">
                      {plan.analytics_access ? (
                        <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>{t('subscription.analyticsAccess')}</span>
                    </li>
                    <li className="flex items-start">
                      {plan.priority_support ? (
                        <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <XMarkIcon className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
                      )}
                      <span>{t('subscription.prioritySupport')}</span>
                    </li>
                    {featuresArray.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <CheckIcon className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <XMarkIcon className="h-6 w-6 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        <span>{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full mt-8 py-3 rounded-lg font-medium ${isCurrentPlan
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'}`}
                    onClick={() => handleSelectPlan(plan.slug)}
                    disabled={processingPlan !== null}
                  >
                    {processingPlan === plan.slug ? (
                      <div className="flex justify-center items-center">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">{t('subscription.processing')}</span>
                      </div>
                    ) : isCurrentPlan ? (
                      t('subscription.currentPlan')
                    ) : (
                      <>
                        <span>{price > 0 ? t('subscription.selectPlan') : t('subscription.startFree')}</span>
                        {price > 0 && <ShoppingCartIcon className="h-5 w-5 ml-2 inline-block" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">{t('subscription.allPlans')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('subscription.secureTransactions')}</h3>
              <p className="text-gray-300">{t('subscription.secureDesc')}</p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('subscription.vehicleHistory')}</h3>
              <p className="text-gray-300">{t('subscription.vehicleHistoryDesc')}</p>
            </div>
            <div className="p-6 bg-gray-700 rounded-lg">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <RocketLaunchIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('subscription.support24_7')}</h3>
              <p className="text-gray-300">{t('subscription.support24_7Desc')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">{t('subscription.faqTitle')}</h2>
          <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{t('subscription.faqUpgrade')}</h3>
              <p className="text-gray-300">{t('subscription.faqUpgradeAnswer')}</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{t('subscription.faqExceed')}</h3>
              <p className="text-gray-300">{t('subscription.faqExceedAnswer')}</p>
            </div>
            <div className="p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{t('subscription.faqCancel')}</h3>
              <p className="text-gray-300">{t('subscription.faqCancelAnswer')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
