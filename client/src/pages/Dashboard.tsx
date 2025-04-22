import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface DashboardStat {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
}

interface VehicleOverview {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  views: number;
  inquiries: number;
  daysListed: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentListings, setRecentListings] = useState<VehicleOverview[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        setUserRole(data.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Fetch recent listings if seller
        const { data: listings, error: listingsError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (listingsError) throw listingsError;
        
        // Transform listings data
        const formattedListings = listings?.map(listing => ({
          id: listing.id,
          title: `${listing.year} ${listing.make} ${listing.model}`,
          price: listing.price,
          imageUrl: listing.images?.[0] || '/assets/car-placeholder.jpg',
          views: Math.floor(Math.random() * 500), // Replace with actual analytics data
          inquiries: Math.floor(Math.random() * 20), // Replace with actual analytics data
          daysListed: Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))
        })) || [];
        
        setRecentListings(formattedListings);
        
        // Fetch recent messages
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id, 
            content, 
            created_at,
            vehicles!inner(id, make, model, year),
            profiles!sender_id(id, full_name, avatar_url)
          `)
          .or(`receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (messagesError) throw messagesError;
        setRecentMessages(messages || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
    fetchDashboardData();
  }, [user]);

  // Example stats for the dashboard
  const sellerStats: DashboardStat[] = [
    {
      title: 'Active Listings',
      value: recentListings.length,
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Views',
      value: recentListings.reduce((sum, listing) => sum + listing.views, 0),
      change: 24.5,
      icon: EyeIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      value: recentMessages.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Inquiries',
      value: recentListings.reduce((sum, listing) => sum + listing.inquiries, 0),
      change: 8.2,
      icon: UserGroupIcon,
      color: 'bg-yellow-500'
    }
  ];

  const buyerStats: DashboardStat[] = [
    {
      title: 'Saved Cars',
      value: '12',
      icon: HeartIcon,
      color: 'bg-red-500'
    },
    {
      title: 'Recent Searches',
      value: '24',
      icon: ChartBarIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Messages',
      value: recentMessages.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'New Listings Today',
      value: '38',
      icon: PlusCircleIcon,
      color: 'bg-green-500'
    }
  ];

  const stats = userRole === 'seller' ? sellerStats : buyerStats;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {userRole === 'seller' ? 'Seller Dashboard' : 'Buyer Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                {userRole === 'seller' && (
                  <Link
                    to="/dashboard/create-listing"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    New Listing
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 rounded-md p-3 ${stat.color} bg-opacity-10`}>
                        <stat.icon className={`h-6 w-6 ${stat.color.replace('bg', 'text')}`} />
                      </div>
                      {stat.change !== undefined && (
                        <div className={`ml-auto text-sm flex items-center ${
                          stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {stat.change >= 0 ? '+' : ''}{stat.change}%
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-semibold text-gray-900">{stat.value}</h3>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Seller-specific content */}
                {userRole === 'seller' && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Your Listings</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {recentListings.length > 0 ? (
                        recentListings.map(listing => (
                          <div key={listing.id} className="p-6">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-20 w-32 bg-gray-200 rounded-md overflow-hidden">
                                <img 
                                  src={listing.imageUrl} 
                                  alt={listing.title}
                                  className="h-full w-full object-cover" 
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="text-base font-medium text-gray-900">
                                      <Link to={`/dashboard/edit-listing/${listing.id}`}>
                                        {listing.title}
                                      </Link>
                                    </h4>
                                    <p className="mt-1 text-sm text-gray-500">{listing.daysListed} days listed</p>
                                  </div>
                                  <p className="text-lg font-medium text-gray-900">${listing.price.toLocaleString()}</p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                  <div className="flex items-center">
                                    <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    {listing.views} views
                                  </div>
                                  <div className="flex items-center">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    {listing.inquiries} inquiries
                                  </div>
                                </div>
                                <div className="mt-3 flex space-x-2">
                                  <Link 
                                    to={`/dashboard/edit-listing/${listing.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                  >
                                    Edit
                                  </Link>
                                  <Link 
                                    to={`/cars/${listing.id}`}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">You don't have any listings yet.</p>
                          <Link
                            to="/dashboard/create-listing"
                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            Create Your First Listing
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    {recentListings.length > 0 && (
                      <div className="bg-gray-50 px-6 py-3 flex justify-center">
                        <Link 
                          to="/dashboard/my-listings"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          View All Listings
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Buyer-specific content */}
                {userRole === 'buyer' && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Recently Viewed Cars</h3>
                    </div>
                    
                    <div className="p-6 text-center">
                      <p className="text-gray-500">You haven't viewed any cars yet.</p>
                      <Link
                        to="/search"
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        Browse Cars
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Messages section - for both seller and buyer */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {recentMessages.length > 0 ? (
                      recentMessages.map(message => (
                        <div key={message.id} className="p-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full"
                                src={message.profiles?.avatar_url || '/assets/default-avatar.png'}
                                alt={message.profiles?.full_name} 
                              />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {message.profiles?.full_name}
                              </div>
                              <div className="mt-1 text-sm text-gray-700">
                                {message.content}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleDateString()} • 
                                Re: {message.vehicles?.year} {message.vehicles?.make} {message.vehicles?.model}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">You don't have any messages yet.</p>
                      </div>
                    )}
                  </div>
                  
                  {recentMessages.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 flex justify-center">
                      <Link 
                        to="/dashboard/messages"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View All Messages
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {userRole === 'seller' ? (
                      <>
                        <Link
                          to="/dashboard/create-listing"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-blue-500 bg-opacity-10 p-2 rounded-md">
                            <PlusCircleIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">List a New Vehicle</h4>
                            <p className="text-xs text-gray-500">Create a new car listing</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/dashboard/messages"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-purple-500 bg-opacity-10 p-2 rounded-md">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">Check Messages</h4>
                            <p className="text-xs text-gray-500">View and respond to buyer inquiries</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/dashboard/transaction-history"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-green-500 bg-opacity-10 p-2 rounded-md">
                            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">View Sales</h4>
                            <p className="text-xs text-gray-500">Check your transaction history</p>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/search"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-blue-500 bg-opacity-10 p-2 rounded-md">
                            <ChartBarIcon className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">Search Cars</h4>
                            <p className="text-xs text-gray-500">Find your next vehicle</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/dashboard/saved"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-red-500 bg-opacity-10 p-2 rounded-md">
                            <HeartIcon className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">Saved Vehicles</h4>
                            <p className="text-xs text-gray-500">View your favorite listings</p>
                          </div>
                        </Link>
                        
                        <Link
                          to="/dashboard/messages"
                          className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                          <div className="flex-shrink-0 bg-purple-500 bg-opacity-10 p-2 rounded-md">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">My Messages</h4>
                            <p className="text-xs text-gray-500">Contact sellers about listings</p>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Tips & Insights */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Tips & Insights</h3>
                  </div>
                  
                  <div className="p-6">
                    {userRole === 'seller' ? (
                      <div className="space-y-4">
                        <div className="rounded-md bg-blue-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-800">Better Photos, Better Results</h4>
                              <p className="mt-1 text-xs text-blue-700">
                                Listings with 5+ photos get 2x more views. Add multiple angles of your vehicle!
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-green-800">Respond Quickly</h4>
                              <p className="mt-1 text-xs text-green-700">
                                Sellers who respond to messages within 1 hour are 80% more likely to make a sale.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-md bg-blue-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-blue-800">Save Your Searches</h4>
                              <p className="mt-1 text-xs text-blue-700">
                                Save your search criteria to get notified when new matches are listed.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-md bg-green-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-green-800">Check Vehicle History</h4>
                              <p className="mt-1 text-xs text-green-700">
                                Always review the full vehicle history report before making a purchase.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;