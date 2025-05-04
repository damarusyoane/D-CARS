import React from 'react';
import { UsersIcon, UserCircleIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface UserStatisticsProps {
  totalUsers:number;
  buyerCount:number;
  sellerCount:number;
  newUsersThisWeek:number;
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
  
  users,

}) => {
  const totalUser = users?.length || 0;
  const buyerCounts = users?.filter(user => user.role === 'buyer').length || 0;
  const sellerCounts = users?.filter(user => user.role === 'seller').length || 0;

  // Calculate new users this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const newUsersThisWeeks = users?.filter(user => 
    new Date(user.created_at) >= oneWeekAgo
  ).length || 0;

  // Calculate user growth percentage
  const userGrowthPercentage = totalUser > 0 
    ? (newUsersThisWeeks / totalUser) * 100 
    : 0;

  // Get recent users (last 5)
  const recentUsers = users?.slice(0, 5) || [];


return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Statistiques des Utilisateurs</h2>
        <p className="text-gray-400 mt-1">Vue d'ensemble de la base d'utilisateurs et de leur activité</p>
      </div>
      
      {/* Cartes de statistiques utilisateur */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Nombre total d'utilisateurs</p>
              <p className="text-2xl font-bold text-white">{totalUser}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <UsersIcon className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Acheteurs</p>
              <p className="text-2xl font-bold text-white">{buyerCounts}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-full">
              <UserCircleIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Vendeurs</p>
              <p className="text-2xl font-bold text-white">{sellerCounts}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full">
              <UserGroupIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Nouveaux cette semaine</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-white">{newUsersThisWeeks}</p>
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
      
      {/* Répartition des utilisateurs */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Répartition des utilisateurs</h3>
        <div className="h-10 bg-gray-700 rounded-lg overflow-hidden flex">
          <div 
            className="bg-blue-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(buyerCounts / totalUser) * 100}%` }}
          >
            {totalUser > 0 ? `${Math.round((buyerCounts / totalUser) * 100)}%` : '0%'}
          </div>
          <div 
            className="bg-purple-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${(sellerCounts / totalUser) * 100}%` }}
          >
            {totalUser > 0 ? `${Math.round((sellerCounts / totalUser) * 100)}%` : '0%'}
          </div>
          <div 
            className="bg-green-500 h-full flex items-center justify-center text-xs text-white font-medium"
            style={{ width: `${((totalUser - buyerCounts - sellerCounts) / totalUser) * 100}%` }}
          >
            {totalUser > 0 ? `${Math.round(((totalUser - buyerCounts - sellerCounts) / totalUser) * 100)}%` : '0%'}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Acheteurs</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Vendeurs</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-400">Admins & Autres</span>
          </div>
        </div>
      </div>
      
      {/* Utilisateurs récents */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Utilisateurs récemment inscrits</h3>
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
            <p className="text-gray-400 text-center py-4">Aucun utilisateur trouvé</p>
          )}
        </div>
      </div>
      
      {/* Gestion des rôles */}
      <div className="p-6 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white mb-4">Gestion des rôles utilisateurs</h3>
        <p className="text-gray-400 mb-4">Attribuez des rôles appropriés aux utilisateurs pour gérer leurs autorisations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Acheteurs</h4>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 text-xs rounded-full">{buyerCounts}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Utilisateurs qui peuvent parcourir et acheter des véhicules</p>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
              Gérer les Acheteurs
            </button>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Vendeurs</h4>
              <span className="bg-purple-500/20 text-purple-400 px-2 py-1 text-xs rounded-full">{sellerCounts}</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Utilisateurs qui peuvent mettre des véhicules en vente</p>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm">
              Gérer les Vendeurs
            </button>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Administrateurs</h4>
              <span className="bg-red-500/20 text-red-400 px-2 py-1 text-xs rounded-full">
                {users.filter(u => u.role === 'admin').length}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-3">Utilisateurs avec un accès complet à la plateforme</p>
            <button className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm">
              Gérer les Administrateurs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatistics;
