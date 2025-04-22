import React from 'react';
import { UsersIcon, UserCircleIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface UserStatisticsProps {
  totalUsers: number;
  buyerCount: number;
  sellerCount: number;
  newUsersThisWeek: number;
  users: Array<{
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
    created_at: string;
  }>;
  onRoleChange: (userId: string, newRole: 'user' | 'admin' | 'seller' | 'buyer') => Promise<void>;
}

const UserStatistics: React.FC<UserStatisticsProps> = ({
  totalUsers,
  buyerCount,
  sellerCount,
  newUsersThisWeek,
  users,
  onRoleChange
}) => {
  // Calculate user growth percentage
  const userGrowthPercentage = totalUsers > 0 ? (newUsersThisWeek / totalUsers) * 100 : 0;
  
  // Get recent users (last 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">User Statistics</h2>
        <p className="text-gray-400 mt-1">Overview of platform user base and activity</p>
      </div>
      
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Buyers</p>
              <p className="text-2xl font-bold text-white">{buyerCount}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-full">
              <UserCircleIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Sellers</p>
              <p className="text-2xl font-bold text-white">{sellerCount}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full">
              <UserGroupIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">New This Week</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-white">{newUsersThisWeek}</p>
                <span className="ml-2 text-xs text-green-400 flex items-center">
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  {userGrowthPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-full">
              <ArrowTrendingUpIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
      
      {/* User Distribution */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">User Distribution</h3>
        <div className="h-10 bg-gray-700 rounded-lg overflow-hidden flex">
          <div 
            className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(buyerCount / totalUsers) * 100}%` }}
          >
            {totalUsers > 0 ? `${Math.round((buyerCount / totalUsers) * 100)}%` : '0%'}
          </div>
          <div 
            className="bg-purple-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(sellerCount / totalUsers) * 100}%` }}
          >
            {totalUsers > 0 ? `${Math.round((sellerCount / totalUsers) * 100)}%` : '0%'}
          </div>
          <div 
            className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${((totalUsers - buyerCount - sellerCount) / totalUsers) * 100}%` }}
          >
            {totalUsers > 0 ? `${Math.round(((totalUsers - buyerCount - sellerCount) / totalUsers) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Buyers</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Sellers</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Admins & Others</span>
          </div>
        </div>
      </div>
      
      {/* Recent Users */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Recently Joined Users</h3>
        <div className="space-y-4">
          {recentUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-600 flex-shrink-0 mr-3 overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <UserCircleIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{user.full_name}</div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-red-500/20 text-red-400' 
                    : user.role === 'seller'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role}
                </span>
                <span className="text-xs text-gray-400 ml-3">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          
          {recentUsers.length === 0 && (
            <p className="text-gray-400 text-center py-4">No users found</p>
          )}
        </div>
      </div>
      
      {/* Role Management */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">User Role Management</h3>
        <p className="text-gray-400 mb-4">Assign appropriate roles to users to manage their permissions</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Buyers</h4>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 text-xs rounded-full">{buyerCount}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Users who can browse and purchase vehicles</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
              Manage Buyers
            </button>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Sellers</h4>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 text-xs rounded-full">{sellerCount}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Users who can list vehicles for sale</p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm">
              Manage Sellers
            </button>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Admins</h4>
              <span className="bg-red-500/20 text-red-400 px-2 py-1 text-xs rounded-full">
                {users.filter(u => u.role === 'admin').length}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Users with full platform access</p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">
              Manage Admins
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
