import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSessionAwareRefresh } from '../hooks/useSessionAwareRefresh';
import LoadingSpinner from '../components/common/LoadingSpinner';

import toast from 'react-hot-toast';
import {
  ChartBarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon,
  BanknotesIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import Notifications from '../components/common/Notifications';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardStat {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ForwardRefExoticComponent<any>;
  color: string;
  link?: string;
}

interface VehicleOverview {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  views: number;
  inquiries: number;
  daysListed: number;
  status: string;
}

interface ActivityItem {
  id: string;
  type: 'message' | 'listing' | 'view' | 'transaction' | 'inquiry' | 'saved';
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  vehicle?: {
    id: string;
    title: string;
  };
  content: string;
  timestamp: string;
  status?: string;
  amount?: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
  vehicle_id: string;
  vehicle?: {
    make: string;
    model: string;
    year: number;
  };
}

const Dashboard: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const { user, isLoading: isAuthLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recentListings, setRecentListings] = useState<VehicleOverview[]>([]);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [, setNotificationCount] = useState<number>(0);
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const pieChartRef = useRef<HTMLCanvasElement | null>(null);
  const lineChart = useRef<Chart | null>(null);
  const pieChart = useRef<Chart | null>(null);
  const navigate = useNavigate();
  const initialDataLoaded = useRef(false);

  // --- HELPERS FOR FALLBACKS ---
  const fallbackAvatar = '/assets/default-avatar.png';
  const fallbackCarImg = '/assets/car-placeholder.jpg';

  // --- FETCH USER ROLE, DASHBOARD DATA, ETC ---
  useEffect(() => {
    if (!user || initialDataLoaded.current) return;
    
    const fetchAll = async () => {
      setIsLoading(true);
      setDashboardError(null);
      try {
        await fetchUserRole();
        await Promise.all([
          fetchDashboardData(),
          fetchTransactions(),
          fetchActivityFeed(),
          fetchNotifications()
        ]);
        initialDataLoaded.current = true;
      } catch (err) {
        setDashboardError('Échec du chargement des données du tableau de bord.');
        console.error('[Dashboard] Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAll();
    
    // Real-time messages subscription
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, (_payload) => {
        setNotificationCount(prev => prev + 1);
        toast.success('Vous avez un nouveau message !');
        fetchDashboardData();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
    // eslint-disable-next-line
  }, [user]);

  // --- FETCH FUNCTIONS ---
  // User Role
  const fetchUserRole = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, full_name, is_admin')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('[Dashboard] Error fetching user role/profile:', error, 'Response:', data);
        throw error;
      }
      if (!data) {
        setDashboardError('Profil utilisateur introuvable.');
        console.error('[Dashboard] No profile data found for user:', user.id);
        return;
      }
      setUserRole(data.role);
      setUserName(data.full_name || '');
      if (data.is_admin && window.location.pathname !== '/admin') {
        navigate('/admin', { replace: true });
      }
    } catch (error) {
      setDashboardError('Erreur lors de la récupération du rôle utilisateur.');
      console.error('Error fetching user role:', error);
    }
  };
  
  // Dashboard Data (Listings & Messages)
  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const { data: listings, error: listingsError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (listingsError) throw listingsError;

      const { data: analytics } = await supabase
        .from('vehicle_analytics')
        .select('vehicle_id, views, inquiries')
        .in('vehicle_id', listings?.map(l => l.id) || []);

      const formattedListings = listings?.map((listing: any) => {
        const stats = analytics?.find((a: any) => a.vehicle_id === listing.id) || { views: 0, inquiries: 0 };
        return {
          id: listing.id,
          title: `${listing.year} ${listing.make} ${listing.model}`,
          price: listing.price,
          imageUrl: listing.images?.[0] || fallbackCarImg,
          views: stats.views || 0,
          inquiries: stats.inquiries || 0,
          status: listing.status,
          daysListed: Math.floor((Date.now() - new Date(listing.created_at).getTime()) / (1000 * 60 * 60 * 24))
        };
      }) || [];

      setRecentListings(formattedListings);

      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id, 
          content, 
          created_at,
          vehicles!inner(id, make, model, year),
          profiles!sender_id(id, full_name, avatar_url)
        `)
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);
      if (messagesError) throw messagesError;
      setRecentMessages(messages || []);
    } catch (error) {
      setDashboardError('Erreur lors de la récupération des données du tableau de bord.');
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  useSessionAwareRefresh(fetchDashboardData);

  // Transactions
  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          vehicle:vehicles(make, model, year)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  // Activity Feed
  const fetchActivityFeed = async () => {
    if (!user) return;
    try {
      const activities: ActivityItem[] = [];

      const { data: messages } = await supabase
        .from('messages')
        .select(`
          id, content, created_at,
          vehicles(id, make, model, year),
          profiles!sender_id(id, full_name, avatar_url)
        `)
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messages) {
        messages.forEach((msg: any) => {
          activities.push({
            id: msg.id,
            type: 'message',
            user: Array.isArray(msg.profiles)
              ? {
                id: msg.profiles[0]?.id,
                name: msg.profiles[0]?.full_name,
                avatar: msg.profiles[0]?.avatar_url || fallbackAvatar
              }
              : {
                id: msg.profiles?.id,
                name: msg.profiles?.full_name,
                avatar: msg.profiles?.avatar_url || fallbackAvatar
              },
            vehicle: Array.isArray(msg.vehicles)
              ? {
                id: msg.vehicles[0]?.id,
                title: `${msg.vehicles[0]?.year} ${msg.vehicles[0]?.make} ${msg.vehicles[0]?.model}`
              }
              : msg.vehicles
              ? {
                id: msg.vehicles?.id,
                title: `${msg.vehicles?.year} ${msg.vehicles?.make} ${msg.vehicles?.model}`
              }
              : undefined,
            content: msg.content,
            timestamp: msg.created_at
          });
        });
      }

      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
          id, type, amount, status, created_at,
          vehicle:vehicles(id, make, model, year),
          buyer:profiles!transactions_buyer_id_fkey(id, full_name),
          seller:profiles!transactions_seller_id_fkey(id, full_name)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentTransactions) {
        recentTransactions.forEach((tx: any) => {
          const isCurrentUserBuyer = (Array.isArray(tx.buyer) ? tx.buyer[0]?.id : tx.buyer?.id) === user.id;
          activities.push({
            id: tx.id,
            type: 'transaction',
            user: isCurrentUserBuyer
              ? {
                id: Array.isArray(tx.seller) ? tx.seller[0]?.id : tx.seller?.id,
                name: Array.isArray(tx.seller) ? tx.seller[0]?.full_name : tx.seller?.full_name
              }
              : {
                id: Array.isArray(tx.buyer) ? tx.buyer[0]?.id : tx.buyer?.id,
                name: Array.isArray(tx.buyer) ? tx.buyer[0]?.full_name : tx.buyer?.full_name
              },
            vehicle: Array.isArray(tx.vehicle)
              ? {
                id: tx.vehicle[0]?.id,
                title: `${tx.vehicle[0]?.year} ${tx.vehicle[0]?.make} ${tx.vehicle[0]?.model}`
              }
              : tx.vehicle
              ? {
                id: tx.vehicle?.id,
                title: `${tx.vehicle?.year} ${tx.vehicle?.make} ${tx.vehicle?.model}`
              }
              : undefined,
            content: `${isCurrentUserBuyer ? 'Vous avez acheté' : 'Vous avez vendu'} un véhicule pour ${tx.amount.toLocaleString()} XAF`,
            timestamp: tx.created_at,
            status: tx.status,
            amount: tx.amount
          });
        });
      }

      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityFeed(activities);
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    }
  };

  // Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('read', false);

      if (error) throw error;
      setNotificationCount(count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Refresh Button Handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchTransactions(),
        fetchActivityFeed(),
        fetchNotifications(),
      ]);
      toast.success('Dashboard refreshed!');
      
      // Re-initialize charts after data refresh
      initializeCharts();
    } catch (error) {
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Separate function to initialize both charts
  const initializeCharts = () => {
    if (userRole === 'seller') {
      if (lineChartRef.current && transactions.length > 0) {
        initializeLineChart();
      }
      
      if (pieChartRef.current && recentListings.length > 0) {
        initializePieChart();
      }
    }
  };

  // Initialize charts when data and DOM elements are available
  useEffect(() => {
    // Only run this effect when both data is loaded and the component is fully rendered
    if (!isLoading && userRole === 'seller' && initialDataLoaded.current) {
      // Destroy existing charts to prevent memory leaks
      if (lineChart.current) {
        lineChart.current.destroy();
        lineChart.current = null;
      }
      
      if (pieChart.current) {
        pieChart.current.destroy();
        pieChart.current = null;
      }
      
      // Initialize charts with a small delay to ensure refs are ready
      const timer = setTimeout(() => {
        initializeCharts();
      }, 100);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [isLoading, userRole, transactions.length, recentListings.length]);

  // Clean up charts when component unmounts
  useEffect(() => {
    return () => {
      if (lineChart.current) {
        lineChart.current.destroy();
      }
      if (pieChart.current) {
        pieChart.current.destroy();
      }
    };
  }, []);

  const initializeLineChart = () => {
    if (!lineChartRef.current) return;
    
    // Ensure we have the canvas context
    const ctx = lineChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart to prevent duplicates
    if (lineChart.current) {
      lineChart.current.destroy();
    }

    // Prepare data
    const completedTransactions = transactions.filter(tx => tx.status === 'completed')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    if (completedTransactions.length === 0) return;
    
    const dates = completedTransactions.map(tx => 
      new Date(tx.created_at).toLocaleDateString('default', { month: 'short', day: 'numeric' }));

    const amounts = completedTransactions.map(tx => tx.amount);

    // Create chart
    lineChart.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Montant de la Transaction (XAF)',
          data: amounts,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (context) {
                return `$${context.parsed.y.toLocaleString()}`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function (value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  };

  const initializePieChart = () => {
    if (!pieChartRef.current) return;
    
    // Ensure we have the canvas context
    const ctx = pieChartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Destroy existing chart to prevent duplicates
    if (pieChart.current) {
      pieChart.current.destroy();
    }

    // Skip if no data
    if (recentListings.length === 0) return;
    
    // Count listings by status
    const statuses = recentListings.reduce<Record<string, number>>((acc, listing) => {
      const status = listing.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Create chart
    pieChart.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statuses).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{
          data: Object.values(statuses),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)', // blue
            'rgba(16, 185, 129, 0.7)', // green
            'rgba(245, 158, 11, 0.7)', // yellow
            'rgba(239, 68, 68, 0.7)',  // red
            'rgba(168, 85, 247, 0.7)'  // purple
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        },
        cutout: '70%'
      }
    });
  };

  const sellerStats: DashboardStat[] = [
    {
      title: 'Active Listings',
      value: recentListings.filter((l: any) => l.status === 'active').length,
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      link: '/dashboard/my-listings'
    },
    {
      title: 'Total Views',
      value: recentListings.reduce((sum: any, listing: any) => sum + listing.views, 0),
      change: 24.5,
      icon: EyeIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Messages',
      value: recentMessages.length,
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      link: '/dashboard/messages'
    },
    {
      title: 'Monthly Sales',
      value: `$${transactions
        .filter((t: any) => t.status === 'completed' && new Date(t.created_at).getMonth() === new Date().getMonth())
        .reduce((sum: any, t: any) => sum + (t.amount || 0), 0).toLocaleString()}`,
      change: 12.3,
      icon: BanknotesIcon,
      color: 'bg-yellow-500',
      link: '/dashboard/transaction-history'
    }
  ];

  const buyerStats: DashboardStat[] = [
    {
      title: 'Saved Cars',
      value: '12',
      icon: HeartIcon,
      color: 'bg-red-500',
      link: '/dashboard/saved'
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
      color: 'bg-purple-500',
      link: '/dashboard/messages'
    },
    {
      title: 'New Listings Today',
      value: '38',
      icon: PlusCircleIcon,
      color: 'bg-green-500',
      link: '/search'
    }
  ];

  const stats = userRole === 'seller' ? sellerStats : buyerStats;

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
        <p className="text-gray-500 dark:text-gray-400">Veuillez vous connecter pour voir votre tableau de bord.</p>
      </div>
    );
  }
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activePage="dashboard" />
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <header className="bg-white/90 dark:bg-gray-800/90 shadow-sm z-10 backdrop-blur-md border-b border-gray-100 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4 transition-all duration-300">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1">
                  Bienvenue{userName ? `, ${userName}` : ''} !
                </h1>
                <p className="text-gray-500 dark:text-gray-300 text-base font-medium">
                  {userRole === 'seller' ? 'Tableau de Bord Vendeur' : 'Tableau de Bord Acheteur'}
                </p>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={handleRefresh}
                  className={`flex items-center px-4 py-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-700/80 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 gap-2 ${isRefreshing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing ? "true" : "false"}
                >
                  <ArrowPathIcon className={`h-5 w-5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Actualisation...' : 'Actualiser'}
                </button>

                <div className="relative z-30">
                  <Notifications />
                </div>

                {userRole === 'seller' && (
                  <Link
                    to="/dashboard/create-listing"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 gap-2"
                  >
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    New Listing
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {dashboardError && (
              <div className="mb-6 p-4 rounded-lg border-l-4 border-red-400 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200 shadow-sm animate-fade-in">
                {dashboardError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <Link
                  key={stat.title}
                  to={stat.link || '#'}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden h-32 flex flex-col justify-between p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group focus:ring-2 focus:ring-blue-500 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 rounded-full p-3 ${stat.color} bg-opacity-15 group-hover:bg-opacity-25 transition-all`}>
                      <stat.icon className={`h-7 w-7 ${stat.color.replace('bg', 'text')}`} />
                    </div>
                    {stat.change !== undefined && (
                      <div className={`ml-auto text-sm flex items-center ${
                        stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        <span className="flex items-center">
                          {stat.change >= 0 ? (
                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowTrendingUpIcon className="h-3 w-3 mr-1 transform rotate-180" />
                          )}
                          {stat.change >= 0 ? '+' : ''}{stat.change}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{stat.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            {userRole === 'seller' && (
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Transaction History
                  </h3>
                  <div className="h-64">
                    {transactions.length > 0 ? (
                      <canvas ref={lineChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">Aucune donnée de transaction disponible</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600" />
                    État des Annonces
                  </h3>
                  <div className="h-64">
                    {recentListings.length > 0 ? (
                      <canvas ref={pieChartRef} />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500 dark:text-gray-400">Aucune donnée d'annonce disponible</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          
            )}
            

            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activité Récente</h3>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activityFeed.length > 0 ? activityFeed.map((activity: ActivityItem) => (
                    <div key={activity.id} className="p-6">
                      <div className="flex">
                        <div className="mr-4 flex-shrink-0">
                          {activity.type === 'message' && (
                            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
                              <ChatBubbleLeftRightIcon className="h-5 w-5 text-purple-500" />
                            </div>
                          )}
                          {activity.type === 'transaction' && (
                            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                              <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                            {activity.content}
                          </p>
                          {activity.vehicle && (
                            <p className="mt-1 text-xs text-gray-500">
                              À propos de: <span className="text-primary-600 dark:text-primary-400">{activity.vehicle.title}</span>
                            </p>
                          )}
                          {activity.status && (
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                activity.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">Pas d'activités récentes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {userRole === 'seller' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Vos Annonces</h3>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentListings.length > 0 ? (
                        recentListings.map((listing: any) => (
                          <div key={listing.id} className="p-6">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 h-20 w-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm">
                                <img
                                  src={listing.imageUrl}
                                  alt={listing.title}
                                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = fallbackCarImg; }}
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
                                    <p className="mt-1 text-sm text-gray-500">{listing.daysListed} jours listés</p>
                                  </div>
                                  <p className="text-lg font-medium text-gray-900">${listing.price.toLocaleString()}</p>
                                  <div className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Actif</div>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                  <div className="flex items-center">
                                    <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{listing.views} vues</span>
                                  </div>
                                  <div className="flex items-center">
                                    <ChatBubbleOvalLeftIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{listing.inquiries} demandes</span>
                                  </div>
                                </div>
                                <div className="mt-3 flex space-x-2">
                                  <Link
                                    to={`/dashboard/edit-listing/${listing.id}`}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                                  >
                                    Modifier
                                  </Link>
                                  <Link
                                    to={`/cars/${listing.id}`}
                                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                  >
                                    Voir détails
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-500">Vous n'avez pas encore d'annonces.</p>
                          <Link
                            to="/dashboard/create-listing"
                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <PlusCircleIcon className="h-5 w-5 mr-2" />
                            Créer votre première annonce
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
                          Voir vos annonces
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {userRole === 'buyer' && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900">Voitures Récemment Consultées</h3>
                    </div>

                    <div className="p-6 text-center">
                      <p className="text-gray-500">Vous n'avez pas encore consulté de voitures.</p>
                      <Link
                        to="/search"
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        Parcourir les Voitures
                      </Link>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900">Messages récents</h3>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {recentMessages.length > 0 ? (
                      recentMessages.map((message: any) => (
                        <div key={message.id} className="p-6">
                          <div className="flex items-start">
                            <div className="flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-full border-2 border-gray-200 dark:border-gray-700 object-cover shadow-sm"
                                src={Array.isArray(message.profiles) ? message.profiles[0]?.avatar_url : message.profiles?.avatar_url || fallbackAvatar}
                                alt={Array.isArray(message.profiles) ? message.profiles[0]?.full_name : message.profiles?.full_name || 'User'}
                                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => { (e.target as HTMLImageElement).src = fallbackAvatar; }}
                              />
                            </div>
                            <div className="ml-3 flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {message.profiles[0]?.full_name}
                              </div>
                              <div className="mt-1 text-sm text-gray-700">
                                {message.content}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleDateString()} • 
                                Re: {Array.isArray(message.vehicles) ? `${message.vehicles[0]?.year} ${message.vehicles[0]?.make} ${message.vehicles[0]?.model}` : `${message.vehicles?.year} ${message.vehicles?.make} ${message.vehicles?.model}`}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center">
                        <p className="text-gray-500">Vous n'avez pas de messages.</p>
                      </div>
                    )}
                  </div>
                  
                  {recentMessages.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 flex justify-center">
                      <Link 
                        to="/dashboard/messages"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                         Voir tous les messages
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
                    <h3 className="text-lg font-medium text-gray-900">Actions Rapides</h3>
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
                            <h4 className="text-sm font-medium text-gray-900">Ajouter un Nouveau Véhicule</h4>
                            <p className="text-xs text-gray-500">Créer une nouvelle annonce de voiture</p>
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
                            <h4 className="text-sm font-medium text-gray-900">Consulter les Messages</h4>
                            <p className="text-xs text-gray-500">Voir et répondre aux demandes des acheteurs</p>
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
                            <h4 className="text-sm font-medium text-gray-900">Voir les Ventes</h4>
                            <p className="text-xs text-gray-500">Consulter l'historique de vos transactions</p>
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
                            <h4 className="text-sm font-medium text-gray-900">Rechercher des Voitures</h4>
                            <p className="text-xs text-gray-500">Trouvez votre prochain véhicule</p>
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
                            <h4 className="text-sm font-medium text-gray-900">Véhicules Sauvegardés</h4>
                            <p className="text-xs text-gray-500">Voir vos annonces favorites</p>
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
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Messages récents</h3>
                            <p className="text-xs text-gray-500">Contacter les vendeurs à propos des annonces</p>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Tips & Insights */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Conseils & Astuces</h3>
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
                              <h4 className="text-sm font-medium text-blue-800">Meilleures Photos, Meilleurs Résultats</h4>
                              <p className="mt-1 text-xs text-blue-700">
                                Les annonces avec 5+ photos reçoivent 2x plus de vues. Ajoutez plusieurs angles de votre véhicule !
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
                              <h4 className="text-sm font-medium text-green-800">Répondez Rapidement</h4>
                              <p className="mt-1 text-xs text-green-700">
                                Les vendeurs qui répondent aux messages en moins d'une heure ont 80% plus de chances de réaliser une vente.
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
                              <h4 className="text-sm font-medium text-blue-800">Enregistrez Vos Recherches</h4>
                              <p className="mt-1 text-xs text-blue-700">
                                Sauvegardez vos critères de recherche pour être notifié lorsque de nouveaux véhicules correspondants sont ajoutés.
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
                              <h4 className="text-sm font-medium text-green-800">Vérifiez l'Historique du Véhicule</h4>
                              <p className="mt-1 text-xs text-green-700">
                                Consultez toujours le rapport complet d'historique du véhicule avant d'effectuer un achat.
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