import React from 'react';
import Sidebar from '../components/Sidebar';
import Footer from '../components/layout/Footer';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ForwardRefExoticComponent<any>;
}

const Dashboard: React.FC = () => {
  // Example data for the charts
  const monthlyRevenue = [
    { month: 'Jan', amount: 2100 },
    { month: 'Feb', amount: 2400 },
    { month: 'Mar', amount: 1800 },
    { month: 'Apr', amount: 2200 },
    { month: 'May', amount: 2600 },
    { month: 'Jun', amount: 3000 },
    { month: 'Jul', amount: 3400 },
    { month: 'Aug', amount: 3200 },
    { month: 'Sep', amount: 3600 },
    { month: 'Oct', amount: 3800 },
    { month: 'Nov', amount: 4200 },
    { month: 'Dec', amount: 4500 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'new_listing',
      user: 'Alex Johnson',
      details: 'Listed 2021 Tesla Model 3',
      timestamp: '2 hours ago',
    },
    {
      id: 2,
      type: 'sale',
      user: 'Sarah Wilson',
      details: 'Purchased 2020 BMW M4',
      timestamp: '4 hours ago',
    },
    {
      id: 3,
      type: 'message',
      user: 'Mike Brown',
      details: 'Sent message about 2022 Audi Q5',
      timestamp: '5 hours ago',
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: 'listing',
      user: 'John Doe',
      item: '2023 Mercedes-Benz C-Class',
      status: 'pending',
    },
    {
      id: 2,
      type: 'verification',
      user: 'Emma Smith',
      item: 'Dealer verification request',
      status: 'pending',
    },
  ];

  // Stats for the dashboard
  const stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '8,249',
      change: 12.5,
      icon: UserGroupIcon,
    },
    {
      title: 'Active Listings',
      value: '1,836',
      change: -2.4,
      icon: ChartBarIcon,
    },
    {
      title: 'Total Revenue',
      value: '$502,419',
      change: 18.2,
      icon: CurrencyDollarIcon,
    },
    {
      title: 'Messages',
      value: '245',
      change: 5.7,
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activePage="dashboard" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">Analytics & Statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </header>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-gray-800 rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-gray-400" />
                <div className={`flex items-center ${
                  stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.change >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <p className="text-gray-400">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Monthly Revenue Chart */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
            <div className="h-64 flex items-end justify-between">
              {monthlyRevenue.map((data, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-10 bg-blue-500 rounded-t-md" 
                    style={{ height: `${(data.amount / 5000) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Vehicle by Type Pie Chart */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicles by Type</h3>
            <div className="h-56 flex items-center justify-center">
              {/* This is a simplified pie chart using a circular div with a cutout */}
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-8 border-blue-500"></div>
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-green-500 border-r-green-500 border-b-green-500 transform rotate-[60deg]"></div>
                <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-yellow-500 transform rotate-[200deg]"></div>
                
                {/* Center white circle to create donut effect */}
                <div className="absolute inset-[20%] bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Total</p>
                    <p className="text-xl font-bold">8,549</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Sedan (42%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">SUV (38%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-400">Other (20%)</span>
              </div>
            </div>
          </div>
          
          {/* Revenue Trends Line Chart */}
          <div className="bg-gray-800 rounded-lg p-6 col-span-2">
            <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
            <div className="h-56 flex items-center">
              {/* Simplified line chart */}
              <svg className="w-full h-40" viewBox="0 0 300 100">
                <path
                  d="M0,80 C20,70 40,90 60,75 C80,60 100,80 120,70 C140,60 160,50 180,40 C200,30 220,20 240,15 C260,10 280,5 300,0"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <circle cx="60" cy="75" r="3" fill="#3b82f6" />
                <circle cx="120" cy="70" r="3" fill="#3b82f6" />
                <circle cx="180" cy="40" r="3" fill="#3b82f6" />
                <circle cx="240" cy="15" r="3" fill="#3b82f6" />
                <circle cx="300" cy="0" r="3" fill="#3b82f6" />
              </svg>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div className="bg-gray-800 rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gray-700/10 flex items-center justify-center">
                      {activity.type === 'new_listing' && (
                        <ChartBarIcon className="h-4 w-4 text-gray-400" />
                      )}
                      {activity.type === 'sale' && (
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-400" />
                      )}
                      {activity.type === 'message' && (
                        <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.details}
                    </p>
                    <span className="text-xs text-gray-400">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pending Approvals */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Approvals</h3>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <ChartBarIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{approval.item}</p>
                      <p className="text-xs text-gray-400">by {approval.user}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
                      Approve
                    </button>
                    <button className="px-3 py-1 bg-red-500/10 text-red-500 text-sm rounded-lg hover:bg-red-500/20">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;