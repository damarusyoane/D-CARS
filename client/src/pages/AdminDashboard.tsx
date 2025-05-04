import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import {
  UsersIcon,
  ShoppingCartIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TruckIcon,
  ClockIcon,
  BellIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TrafficAnalytics from '../components/admin/TrafficAnalytics';
import AnalyticsChart from '../components/admin/AnalyticsChart';
import CarApprovalWorkflow from '../components/admin/CarApprovalWorkflow';
import UserStatistics from '../components/admin/UserStatistics';
import './AdminDashboard.mobile.css';

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
  status: string;
  seller_id: string;
  images: string[];
  created_at: string;
  seller?: {
    full_name: string;
    email: string;
  };
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
}

interface StatsData {
  totalUsers: number;
  totalVehicles: number;
  totalSales: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeListings: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  conversionRate: number;
  buyerCount: number;
  sellerCount: number;
  averageListingViews: number;
}

const logoutBtnClass = "px-4 py-2 ml-4 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed";

export default function AdminDashboard() {
  const { signOut, profile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{labels: string[], views: number[], inquiries: number[]} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalVehicles: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeListings: 0,
    dailyVisitors: 0,
    weeklyVisitors: 0,
    monthlyVisitors: 0,
    conversionRate: 0,
    buyerCount: 0,
    sellerCount: 0,
    averageListingViews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const checkAuthorization = useCallback(async () => {
    if (!profile || authLoading) {
      return;
    }

    if (profile.role !== 'admin') {
      toast.error("Accès non autorisé");
      navigate('/', { replace: true });
      return;
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const initDashboard = async () => {
      if (!authLoading && profile) {
        await checkAuthorization();
        await fetchData();
      }
    };

    initDashboard();
  }, [profile, authLoading, checkAuthorization]);

  const fetchData = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      setIsLoading(true);

      // Fetch analytics data
      const { data: analytics, error: analyticsError } = await supabase
        .from('vehicle_analytics')
        .select('date, views, inquiries')
        .order('date', { ascending: true });

      if (!analyticsError && analytics) {
        setAnalyticsData({
          labels: analytics.map(d => new Date(d.date).toLocaleDateString()),
          views: analytics.map(d => d.views),
          inquiries: analytics.map(d => d.inquiries)
        });
      }

      // Fetch all stats in parallel
      const [
        usersCount,
        vehiclesCount,
        salesCount,
        pendingCount,
        activeCount,
        revenueData,
        buyerData,
        sellerData,
        newUsersThisWeek,
        vehiclesData,
        usersData
      ] = await Promise.all([
        supabase.from('profiles').select('count', { head: true, count: 'exact' }),
        supabase.from('vehicles').select('count', { head: true, count: 'exact' }),
        supabase.from('vehicles').select('count', { head: true, count: 'exact' }).eq('status', 'sold'),
        supabase.from('vehicles').select('count', { head: true, count: 'exact' }).eq('status', 'pending'),
        supabase.from('vehicles').select('count', { head: true, count: 'exact' }).eq('status', 'active'),
        supabase.from('transactions').select('sum(amount)'),
        supabase.from('profiles').select('count', { head: true, count: 'exact' }).eq('role', 'buyer'),
        supabase.from('profiles').select('count', { head: true, count: 'exact' }).eq('role', 'seller'),
        supabase
          .from('profiles')
          .select('count', { head: true, count: 'exact' })
          .gte('created_at', new Date().toISOString().split('T')[0] + ' 00:00:00'),
        supabase
          .from('vehicles')
          .select('*, seller:profiles(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
      ]);

      // Update stats
      setStats({
        totalUsers: usersCount.count || 0,
        totalVehicles: vehiclesCount.count || 0,
        totalSales: salesCount.count || 0,
        totalRevenue: revenueData.data?.[0]?.sum?.[0]?.amount || 0,
        pendingApprovals: pendingCount.count || 0,
        activeListings: activeCount.count || 0,
        dailyVisitors: 0,
        weeklyVisitors: newUsersThisWeek.count || 0,
        monthlyVisitors: 0,
        conversionRate: 0,
        buyerCount: buyerData.count || 0,
        sellerCount: sellerData.count || 0,
        averageListingViews: 0
      });

      // Set data
      setPendingVehicles(vehiclesData.data || []);
      setUsers(usersData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Échec de la récupération des données du tableau de bord');
    } finally {
      setAnalyticsLoading(false);
      setIsLoading(false);
    }
  }, []);

  const handleVehicleApproval = async (vehicleId: string) => {
    try {
      setProcessingId(vehicleId);
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'active' })
        .eq('id', vehicleId);

      if (error) throw error;

      setPendingVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Véhicule approuvé avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Approval failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVehicleRejection = async (vehicleId: string) => {
    try {
      setProcessingId(vehicleId);
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'rejected' })
        .eq('id', vehicleId);

      if (error) throw error;

      setPendingVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success('Véhicule rejeté');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rejection failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('Rôle mis à jour avec succès');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      window.location.href = '/auth/login';
    } catch (error) {
      toast.error('Échec de la déconnexion');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }: { 
    icon: any, 
    title: string, 
    value: string | number, 
    color: string 
  }) => (
    <div className={`bg-gray-800 rounded-lg p-6 border-l-4 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-500/20')}`}>
          <Icon className={`w-5 h-5 ${color.replace('border-', 'text-').replace('-600', '-500')}`} />
        </div>
      </div>
    </div>
  );

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-gray-800 min-h-screen fixed z-30">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">Tableau de Bord Admin</h1>
            <p className="text-sm text-gray-400">Portail de Gestion</p>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                  <HomeIcon className="w-5 h-5 mr-3" />Aperçu
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('pending')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                  <ClockIcon className="w-5 h-5 mr-3" />Approbations en Attente
                  {stats.pendingApprovals > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('users')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                  <UsersIcon className="w-5 h-5 mr-3" />Gestion des Utilisateurs
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center px-4 py-3 rounded-lg ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                  <ChartBarIcon className="w-5 h-5 mr-3" />Analytique
                </button>
              </li>
            </ul>
          </nav>
        </div>
  
        {/* Main Content */}
        <div className="w-full lg:ml-64 min-h-screen flex flex-col bg-gray-900">
          <header className="bg-gray-800 p-4 shadow-lg sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center">
              <button
                className="lg:hidden text-gray-400 hover:text-white mr-4"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold">Tableau de Bord Admin</h1>
                <p className="text-gray-400 text-sm">Bienvenue, {profile.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-white"
                title="Actualiser les données"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
              <button
                className={logoutBtnClass}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
              </button>
            </div>
          </header>
  
          <main className="p-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <StatCard icon={UsersIcon} title="Utilisateurs Totaux" value={stats.totalUsers} color="border-blue-600" />
                  <StatCard icon={TruckIcon} title="Véhicules Totaux" value={stats.totalVehicles} color="border-green-600" />
                  <StatCard icon={TagIcon} title="Annonces Actives" value={stats.activeListings} color="border-purple-600" />
                  <StatCard icon={ShoppingCartIcon} title="Ventes Totales" value={stats.totalSales} color="border-amber-600" />
                  <StatCard icon={CurrencyDollarIcon} title="Revenu Total" value={`XAF${stats.totalRevenue.toLocaleString()}`} color="border-emerald-600" />
                  <StatCard icon={BellIcon} title="Approbations en Attente" value={stats.pendingApprovals} color="border-red-600" />
                </div>
  
                {analyticsLoading ? (
                  <div className="flex justify-center my-8"><LoadingSpinner size="md" /></div>
                ) : analyticsData && (
                  <AnalyticsChart data={analyticsData} />
                )}
  
                <div className="bg-gray-800 rounded-lg p-6 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Approbations en Attente</h2>
                    {pendingVehicles.length > 0 && (
                      <button 
                        onClick={() => setActiveTab('pending')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Voir Tout
                      </button>
                    )}
                  </div>
                  {pendingVehicles.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium">Tout est à jour !</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingVehicles.slice(0, 3).map(vehicle => (
                        <div key={vehicle.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="h-12 w-16 bg-gray-600 rounded mr-4 overflow-hidden">
                              {vehicle.images?.[0] ? (
                                <img 
                                  src={vehicle.images[0]} 
                                  alt={vehicle.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">Pas d'image</div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{vehicle.title}</h3>
                              <p className="text-sm text-gray-400">{vehicle.seller?.full_name}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVehicleApproval(vehicle.id)}
                              disabled={processingId === vehicle.id}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded-full"
                            >
                              <CheckCircleIcon className="w-6 h-6" />
                            </button>
                            <button
                              onClick={() => handleVehicleRejection(vehicle.id)}
                              disabled={processingId === vehicle.id}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"
                            >
                              <XCircleIcon className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
  
            {activeTab === 'pending' && (
              <CarApprovalWorkflow 
                pendingVehicles={pendingVehicles}
                onApprove={handleVehicleApproval}
                onReject={handleVehicleRejection}
                processingId={processingId}
              />
            )}
  
            {activeTab === 'users' && (
              <UserStatistics 
                users={users}
                onRoleChange={handleUserRoleUpdate} totalUsers={0} buyerCount={0} sellerCount={0} newUsersThisWeek={0}              />
            )}
  
            {activeTab === 'analytics' && (
              <TrafficAnalytics 
                dailyVisitors={stats.dailyVisitors}
                weeklyVisitors={stats.weeklyVisitors}
                monthlyVisitors={stats.monthlyVisitors}
                conversionRate={stats.conversionRate} previousPeriodChange={0}              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}