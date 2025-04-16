import React from 'react';
import Sidebar from '../components/Sidebar';
import CommonFooter from '../components/CommonFooter';

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
      type: 'Inquiry', 
      title: 'BMW M4 2022', 
      time: '3 hours ago',
      user: {
        name: 'John Miller',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    { 
      id: 2, 
      type: 'Listing', 
      title: 'Audi A4 2021', 
      time: '5 hours ago',
      user: {
        name: 'Sarah Smith',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
      }
    },
    { 
      id: 3, 
      type: 'Offer', 
      title: 'Tesla Model S', 
      time: 'Yesterday at 3:45PM',
      user: {
        name: 'Michael Brown',
        avatar: 'https://randomuser.me/api/portraits/men/67.jpg'
      }
    },
    { 
      id: 4, 
      type: 'Sale', 
      title: 'Toyota Camry 2020', 
      time: '2 days ago',
      user: {
        name: 'Emily Wilson',
        avatar: 'https://randomuser.me/api/portraits/women/23.jpg'
      }
    },
    { 
      id: 5, 
      type: 'Price Update', 
      title: 'Honda Civic 2019', 
      time: '3 days ago',
      user: {
        name: 'Chris Parker',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
      }
    }
  ];

  const pendingPayments = [
    { id: 1, buyer: 'Alex Johnson', car: 'BMW M4', amount: '$3,500', status: 'pending', dueDate: '05/15/2023' },
    { id: 2, buyer: 'Sarah Miller', car: 'Tesla Model 3', amount: '$2,800', status: 'overdue', dueDate: '04/30/2023' },
    { id: 3, buyer: 'Mike Davis', car: 'Audi Q5', amount: '$4,200', status: 'pending', dueDate: '05/22/2023' },
    { id: 4, buyer: 'Jennifer Wilson', car: 'Mercedes C-Class', amount: '$3,800', status: 'paid', dueDate: '05/10/2023' },
    { id: 5, buyer: 'Robert Taylor', car: 'Toyota Camry', amount: '$1,500', status: 'pending', dueDate: '06/01/2023' }
  ];

  // Stats for the dashboard
  const stats = [
    { 
      id: 1, 
      title: 'Active Listings', 
      value: '8,549',
      change: '+12.5%',
      trend: 'up',
      color: 'blue'
    },
    { 
      id: 2, 
      title: 'Views', 
      value: '1,628',
      change: '+5.3%',
      trend: 'up',
      color: 'green'
    },
    { 
      id: 3, 
      title: 'Total Sales', 
      value: '$329,423',
      change: '+16.8%',
      trend: 'up',
      color: 'purple'
    },
    { 
      id: 4, 
      title: 'Inquiries', 
      value: '57',
      change: '-2.4%',
      trend: 'down',
      color: 'red'
    }
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
              key={stat.id} 
              className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                stat.color === 'blue' ? 'border-blue-500' :
                stat.color === 'green' ? 'border-green-500' :
                stat.color === 'purple' ? 'border-purple-500' :
                'border-red-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`flex items-center ${
                  stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.trend === 'up' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  <span className="ml-1">{stat.change}</span>
                </div>
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
              <div className="relative w-40 h-40">
                {/* This is a simplified pie chart using a circular div with a cutout */}
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
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b border-gray-700 pb-4">
                  <div className="flex items-center">
                    <img 
                      src={activity.user.avatar} 
                      alt={activity.user.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium">{activity.user.name}</p>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className={`px-2 py-0.5 rounded text-xs mr-2 ${
                          activity.type === 'Inquiry' ? 'bg-blue-900 text-blue-300' :
                          activity.type === 'Listing' ? 'bg-green-900 text-green-300' :
                          activity.type === 'Offer' ? 'bg-yellow-900 text-yellow-300' :
                          activity.type === 'Sale' ? 'bg-purple-900 text-purple-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {activity.type}
                        </span>
                        <span>{activity.title}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))}
              <button className="text-blue-400 text-sm hover:text-blue-300 mt-2">View All Recent Activities</button>
            </div>
          </div>
          
          {/* Pending Payments */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Pending Payments</h3>
            <div className="space-y-3">
              {pendingPayments.slice(0, 3).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between border-b border-gray-700 pb-3">
                  <div>
                    <p className="font-medium">{payment.buyer}</p>
                    <p className="text-sm text-gray-400">{payment.car}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{payment.amount}</p>
                    <p className={`text-xs ${
                      payment.status === 'pending' ? 'text-yellow-400' :
                      payment.status === 'overdue' ? 'text-red-400' :
                      'text-green-400'
                    }`}>
                      {payment.status === 'pending' ? 'Pending' :
                       payment.status === 'overdue' ? 'Overdue' :
                       'Paid'}
                    </p>
                  </div>
                </div>
              ))}
              <button className="text-blue-400 text-sm hover:text-blue-300 mt-2">View All Payments</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <CommonFooter />
    </div>
  );
};

export default Dashboard;