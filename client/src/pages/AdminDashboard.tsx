import { useState, useEffect } from 'react';
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
  UserCircleIcon,
  TruckIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

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
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingVehicles, setPendingVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalVehicles: 0,
    totalSales: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
    activeListings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Verify admin role
    const checkAdminRole = async () => {
      try {
        if (!user) {
          navigate('/auth/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
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
  }, [user, navigate]);

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
      
      setStats({
        totalUsers: usersCount.count || 0,
        totalVehicles: vehiclesCount.count || 0,
        totalSales: salesCount.count || 0,
        totalRevenue: totalRevenue,
        pendingApprovals: pendingCount.count || 0,
        activeListings: activeCount.count || 0
      });

      // Fetch pending vehicles
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

  const handleVehicleApproval = async (vehicleId: string, approve: boolean) => {
    try {
      setProcessingId(vehicleId);
      
      const { error } = await supabase
        .from('vehicles')
        .update({ status: approve ? 'active' : 'rejected' })
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
            title: approve ? 'Vehicle Listing Approved' : 'Vehicle Listing Rejected',
            message: approve 
              ? `Your listing for ${vehicle.make} ${vehicle.model} has been approved and is now live.`
              : `Your listing for ${vehicle.make} ${vehicle.model} has been rejected. Please contact support for more information.`,
            type: approve ? 'success' : 'error',
            is_read: false
          });

        if (notificationError) throw notificationError;
      }

      toast.success(approve ? 'Vehicle approved successfully' : 'Vehicle rejected');
      
      // Update local state
      setPendingVehicles(pendingVehicles.filter(v => v.id !== vehicleId));
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      toast.error('Failed to process vehicle');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
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
      {/* Header */}
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage vehicles, users, and view platform statistics</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-700 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-white'}`}
          >
            <ChartBarIcon className="w-5 h-5 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'pending' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-white'}`}
          >
            <ClockIcon className="w-5 h-5 inline mr-2" />
            Pending Approvals
            {stats.pendingApprovals > 0 && (
              <span className="ml-2 bg-blue-500 text-xs rounded-full px-2 py-1">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${activeTab === 'users' 
              ? 'text-blue-500 border-b-2 border-blue-500' 
              : 'text-gray-400 hover:text-white'}`}
          >
            <UserCircleIcon className="w-5 h-5 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => fetchData()}
            className="ml-auto px-4 py-2 text-gray-400 hover:text-white"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
        
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            </div>
            
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveTab('pending')}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <ClockIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <span className="block font-medium">Pending Approvals</span>
                    <span className="text-sm text-gray-400">Review new vehicle listings</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('users')}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <UsersIcon className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <span className="block font-medium">Manage Users</span>
                    <span className="text-sm text-gray-400">Update roles and permissions</span>
                  </div>
                </button>
                
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left flex items-center space-x-3 transition-colors"
                >
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <ChartBarIcon className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <span className="block font-medium">Sales Analytics</span>
                    <span className="text-sm text-gray-400">Detailed metrics and reports</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {pendingVehicles.slice(0, 3).map(vehicle => (
                  <div key={vehicle.id} className="p-4 border border-gray-700 rounded-lg flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>
                      <p className="text-sm text-gray-400">New listing pending approval</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVehicleApproval(vehicle.id, true)}
                        className="p-1 text-green-500 hover:bg-green-500/10 rounded-full"
                        disabled={processingId === vehicle.id}
                      >
                        <CheckCircleIcon className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleVehicleApproval(vehicle.id, false)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded-full"
                        disabled={processingId === vehicle.id}
                      >
                        <XCircleIcon className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingVehicles.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No pending approvals</p>
                )}
                {pendingVehicles.length > 3 && (
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className="w-full text-center py-2 text-blue-400 hover:text-blue-300"
                  >
                    View all pending approvals
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'pending' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Pending Vehicle Approvals</h2>
            {pendingVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gray-700">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <p className="text-lg font-medium mb-2">All caught up!</p>
                <p>There are no vehicles waiting for approval</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingVehicles.map(vehicle => (
                  <div key={vehicle.id} className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/4 h-48 bg-gray-700 relative">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img 
                            src={vehicle.images[0]} 
                            alt={`${vehicle.make} ${vehicle.model}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            <span>No image available</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between">
                          <h3 className="text-lg font-semibold">{vehicle.title}</h3>
                          <p className="text-xl font-bold text-green-400">${vehicle.price.toLocaleString()}</p>
                        </div>
                        <p className="text-gray-400 mb-2">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-gray-400 mb-4">{vehicle.location}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                          <div>
                            <span className="font-semibold">Seller:</span> {(vehicle as any).seller?.full_name}
                          </div>
                          <div>
                            <span className="font-semibold">Listed:</span> {new Date(vehicle.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button
                            onClick={() => handleVehicleApproval(vehicle.id, true)}
                            disabled={processingId === vehicle.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
                          >
                            {processingId === vehicle.id ? <LoadingSpinner size="sm" /> : <CheckCircleIcon className="w-5 h-5" />}
                            <span>Approve Listing</span>
                          </button>
                          <button
                            onClick={() => handleVehicleApproval(vehicle.id, false)}
                            disabled={processingId === vehicle.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
                          >
                            {processingId === vehicle.id ? <LoadingSpinner size="sm" /> : <XCircleIcon className="w-5 h-5" />}
                            <span>Reject Listing</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-lg p-6 overflow-hidden">
            <h2 className="text-xl font-semibold mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-700/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0 mr-3 overflow-hidden">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500">
                                <UserCircleIcon className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user.role === 'admin' ? (
                          <button
                            onClick={() => handleUserRoleUpdate(user.id, 'user')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Make User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserRoleUpdate(user.id, 'admin')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}