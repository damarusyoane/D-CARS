import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

// --- Add logout button styles ---
const logoutBtnClass = "px-4 py-2 ml-4 rounded bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed";

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
  Cog6ToothIcon,
  DocumentChartBarIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TrafficAnalytics from '../components/admin/TrafficAnalytics';
import CarApprovalWorkflow from '../components/admin/CarApprovalWorkflow';
import UserStatistics from '../components/admin/UserStatistics';

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
  description?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url: string;
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

export default function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Robust logout handler
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      [localStorage, sessionStorage].forEach(storage => {
        Object.keys(storage)
          .filter((key) => key.startsWith('sb-'))
          .forEach((key) => storage.removeItem(key));
      });
      if ('indexedDB' in window) {
        try { window.indexedDB.deleteDatabase('supabase-auth-client'); } catch (e) {}
      }
      if (typeof supabase.removeAllChannels === 'function') {
        supabase.removeAllChannels();
      }
      toast.success('Logged out successfully!');
      setTimeout(() => { navigate('/auth/login', { replace: true }); }, 300);
    } catch (err) {
      toast.error('Logout failed.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Role-based access control
  if (profile && profile.role !== 'admin') {
    toast.error("You don't have permission to access the admin dashboard");
    navigate('/');
    return null;
  }
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
  const [newUsersThisWeek, setNewUsersThisWeek] = useState(0);
  const [previousPeriodChange] = useState(5.2); // Mock data

  useEffect(() => {
    // Verify admin role
    const checkAdminRole = async () => {
      try {
        if (!profile) {
          navigate('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', profile.id)
          .single();

        if (error) throw error;
        
        if (data.role !== 'admin') {
          toast.error("You don't have permission to access the admin dashboard");
          navigate('/');
          return;
        }
        
        fetchData();
      } catch (error) {
        console.error('Error checking admin role:', error);
        toast.error('Authentication error');
        navigate('/');
      }
    };

    checkAdminRole();
  }, [profile, navigate]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch statistics
      // Fetch count statistics
      const countPromises = [
        supabase.from('profiles').select('count'),
        supabase.from('vehicles').select('count'),
        supabase.from('vehicles').select('count').eq('status', 'sold'),
        supabase.from('vehicles').select('count').eq('status', 'pending'),
        supabase.from('vehicles').select('count').eq('status', 'active')
      ];
      
      // Fetch revenue separately since it has a different response structure
      const revenuePromise = supabase.from('transactions').select('sum(amount)');
      
      // Wait for all promises to resolve
      const [usersCount, vehiclesCount, salesCount, pendingCount, activeCount] = await Promise.all(countPromises);
      const revenue = await revenuePromise;
      
      // Type safe way to access the revenue sum
      let totalRevenue = 0;
      if (revenue.data && revenue.data.length > 0 && revenue.data[0].sum !== null) {
        // Check if sum is an array with amount property
        if (Array.isArray(revenue.data[0].sum) && revenue.data[0].sum.length > 0) {
          // Sum up all amount values if it's an array of objects with amount property
          totalRevenue = revenue.data[0].sum.reduce((acc, curr) => {
            return acc + (typeof curr.amount === 'number' ? curr.amount : 0);
          }, 0);
        } else if (typeof revenue.data[0].sum === 'number') {
          // If it's a direct number value
          totalRevenue = revenue.data[0].sum;
        }
      }

      // Count users by role
      const { data: buyerData } = await supabase
        .from('profiles')
        .select('count')
        .eq('role', 'buyer');
      
      const { data: sellerData } = await supabase
        .from('profiles')
        .select('count')
        .eq('role', 'seller');

      // Count new users in the last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: newUsersData } = await supabase
        .from('profiles')
        .select('count')
        .gte('created_at', oneWeekAgo.toISOString());
      
      const newUsers = newUsersData?.[0]?.count || 0;
      setNewUsersThisWeek(newUsers);

      // Mock data for analytics (in a real app, this would come from analytics service)
      const mockAnalytics = {
        dailyVisitors: Math.floor(Math.random() * 500) + 100,
        weeklyVisitors: Math.floor(Math.random() * 3000) + 1000,
        monthlyVisitors: Math.floor(Math.random() * 10000) + 5000,
        conversionRate: Math.floor(Math.random() * 10) + 1,
        averageListingViews: Math.floor(Math.random() * 50) + 10
      };
      
      setStats({
        totalUsers: usersCount.data?.[0]?.count || 0,
        totalVehicles: vehiclesCount.data?.[0]?.count || 0,
        totalSales: salesCount.data?.[0]?.count || 0,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingCount.data?.[0]?.count || 0,
        activeListings: activeCount.data?.[0]?.count || 0,
        dailyVisitors: mockAnalytics.dailyVisitors,
        weeklyVisitors: mockAnalytics.weeklyVisitors,
        monthlyVisitors: mockAnalytics.monthlyVisitors,
        conversionRate: mockAnalytics.conversionRate,
        buyerCount: buyerData?.[0]?.count || 0,
        sellerCount: sellerData?.[0]?.count || 0,
        averageListingViews: mockAnalytics.averageListingViews
      });

      // Fetch pending vehicles with seller information
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*, seller:profiles(full_name, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setPendingVehicles(vehicles || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleApproval = async (vehicleId: string) => {
    try {
      setProcessingId(vehicleId);
      
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'active' })
        .eq('id', vehicleId);

      if (error) throw error;

      // Find the vehicle and its seller to send notification
      const vehicle = pendingVehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        // Send notification to the seller
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: vehicle.seller_id,
            title: 'Vehicle Listing Approved',
            message: `Your listing for ${vehicle.make} ${vehicle.model} has been approved and is now live.`,
            type: 'success',
            is_read: false
          });

        if (notificationError) throw notificationError;
      }

      toast.success('Vehicle approved successfully');
      
      // Update local state
      setPendingVehicles(pendingVehicles.filter(v => v.id !== vehicleId));
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error approving vehicle:', error);
      toast.error('Failed to approve vehicle');
    } finally {
      setProcessingId(null);
    }
  };

  const handleVehicleRejection = async (vehicleId: string, reason: string) => {
    try {
      setProcessingId(vehicleId);
      
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'rejected' })
        .eq('id', vehicleId);

      if (error) throw error;

      // Find the vehicle and its seller to send notification
      const vehicle = pendingVehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        // Send notification to the seller
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: vehicle.seller_id,
            title: 'Vehicle Listing Rejected',
            message: `Your listing for ${vehicle.make} ${vehicle.model} has been rejected. Reason: ${reason}`,
            type: 'error',
            is_read: false
          });

        if (notificationError) throw notificationError;
      }

      toast.success('Vehicle rejected');
      
      // Update local state
      setPendingVehicles(pendingVehicles.filter(v => v.id !== vehicleId));
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
      toast.error('Failed to reject vehicle');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'user' | 'admin' | 'seller' | 'buyer') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast.success(`User role updated to ${newRole}`);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      fetchData(); // Refresh stats
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, color }: { icon: any, title: string, value: string | number, color: string }) => (
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Admin Dashboard Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 min-h-screen fixed left-0 top-0 z-10 hidden lg:block">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">D-CARS Admin</h1>
            <p className="text-sm text-gray-400">Management Dashboard</p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <HomeIcon className="w-5 h-5 mr-3" />
                  Dashboard Overview
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    activeTab === 'pending' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <ClockIcon className="w-5 h-5 mr-3" />
                  Pending Approvals
                  {stats.pendingApprovals > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <UsersIcon className="w-5 h-5 mr-3" />
                  User Management
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg ${
                    activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5 mr-3" />
                  Traffic Analytics
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/admin/settings')}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-3" />
                  Settings
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <ArrowPathIcon className="w-5 h-5 mr-3" />
                  Back to Site
                </button>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="lg:ml-64 w-full">
          {/* Header */}
          <header className="bg-gray-800 p-6 shadow-lg sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400">Welcome back, {profile?.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={fetchData}
                  className="p-2 text-gray-400 hover:text-white"
                  title="Refresh Data"
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
                <div className="relative">
                  <button className="p-2 text-gray-400 hover:text-white relative" title="Notifications">
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium">{profile?.email?.charAt(0).toUpperCase()}</span>
                </div>
                <button
                  className={logoutBtnClass}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Logout"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            </div>
          </header>
          
          {/* Dashboard Content */}
          <main className="p-6">
            {/* Mobile Navigation */}
            <div className="flex lg:hidden overflow-x-auto mb-6 bg-gray-800 rounded-lg">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-3 whitespace-nowrap ${
                  activeTab === 'overview' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-3 whitespace-nowrap ${
                  activeTab === 'pending' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
                }`}
              >
                Approvals
                {stats.pendingApprovals > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {stats.pendingApprovals}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-3 whitespace-nowrap ${
                  activeTab === 'users' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-3 whitespace-nowrap ${
                  activeTab === 'analytics' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'
                }`}
              >
                Analytics
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                      icon={UsersIcon} 
                      title="Total Users" 
                      value={stats.totalUsers} 
                      color="border-blue-600" 
                    />
                    <StatCard 
                      icon={TruckIcon} 
                      title="Total Listings" 
                      value={stats.totalVehicles} 
                      color="border-green-600" 
                    />
                    <StatCard 
                      icon={TagIcon} 
                      title="Active Listings" 
                      value={stats.activeListings} 
                      color="border-purple-600" 
                    />
                    <StatCard 
                      icon={ShoppingCartIcon} 
                      title="Completed Sales" 
                      value={stats.totalSales} 
                      color="border-amber-600" 
                    />
                    <StatCard 
                      icon={CurrencyDollarIcon} 
                      title="Total Revenue" 
                      value={`$${stats.totalRevenue.toLocaleString()}`} 
                      color="border-emerald-600" 
                    />
                    <StatCard 
                      icon={BellIcon} 
                      title="Pending Approvals" 
                      value={stats.pendingApprovals} 
                      color="border-red-600" 
                    />
                    <StatCard 
                      icon={ChartBarIcon} 
                      title="Daily Visitors" 
                      value={stats.dailyVisitors} 
                      color="border-blue-600" 
                    />
                    <StatCard 
                      icon={DocumentChartBarIcon} 
                      title="Conversion Rate" 
                      value={`${stats.conversionRate}%`} 
                      color="border-amber-600" 
                    />
                  </div>
                  
                  {/* Traffic Analytics Preview */}
                  <TrafficAnalytics 
                    dailyVisitors={stats.dailyVisitors}
                    weeklyVisitors={stats.weeklyVisitors}
                    monthlyVisitors={stats.monthlyVisitors}
                    conversionRate={stats.conversionRate}
                    previousPeriodChange={previousPeriodChange}
                  />
                  
                  {/* Pending Approvals Preview */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Pending Approvals</h2>
                      {pendingVehicles.length > 0 && (
                        <button 
                          onClick={() => setActiveTab('pending')}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View All
                        </button>
                      )}
                    </div>
                    
                    {pendingVehicles.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                        <p className="text-lg font-medium">All caught up!</p>
                        <p>There are no vehicles waiting for approval</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingVehicles.slice(0, 3).map(vehicle => (
                          <div key={vehicle.id} className="bg-gray-700 rounded-lg p-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="h-12 w-16 bg-gray-600 rounded mr-4 overflow-hidden">
                                {vehicle.images && vehicle.images.length > 0 ? (
                                  <img 
                                    src={vehicle.images[0]} 
                                    alt={vehicle.title} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-500">No image</div>
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
                                title="Approve"
                              >
                                <CheckCircleIcon className="w-6 h-6" />
                              </button>
                              <button
                                onClick={() => handleVehicleRejection(vehicle.id, "Does not meet listing requirements")}
                                disabled={processingId === vehicle.id}
                                className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"
                                title="Reject"
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
              
              {/* Pending Approvals Tab */}
              {activeTab === 'pending' && (
                <CarApprovalWorkflow 
                  pendingVehicles={pendingVehicles}
                  onApprove={handleVehicleApproval}
                  onReject={handleVehicleRejection}
                  processingId={processingId}
                />
              )}
              
              {/* User Management Tab */}
              {activeTab === 'users' && (
                <UserStatistics 
                  totalUsers={stats.totalUsers}
                  buyerCount={stats.buyerCount}
                  sellerCount={stats.sellerCount}
                  newUsersThisWeek={newUsersThisWeek}
                  users={users}
                  onRoleChange={handleUserRoleUpdate}
                />
              )}
              
              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <TrafficAnalytics 
                  dailyVisitors={stats.dailyVisitors}
                  weeklyVisitors={stats.weeklyVisitors}
                  monthlyVisitors={stats.monthlyVisitors}
                  conversionRate={stats.conversionRate}
                  previousPeriodChange={previousPeriodChange}
                />
              )}
            </div>
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-800 p-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} D-CARS Admin Dashboard. All rights reserved.
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white text-sm">Help Center</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}