import React from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface TrafficAnalyticsProps {
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  conversionRate: number;
  previousPeriodChange: number;
}

const TrafficAnalytics: React.FC<TrafficAnalyticsProps> = ({
  dailyVisitors,
  weeklyVisitors,
  monthlyVisitors,
  conversionRate,
  previousPeriodChange
}) => {
  // Mock data for the chart
  const mockChartData = [
    { day: 'Mon', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Tue', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Wed', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Thu', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Fri', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Sat', visitors: Math.floor(Math.random() * 100) + 50 },
    { day: 'Sun', visitors: Math.floor(Math.random() * 100) + 50 },
  ];

  const maxVisitors = Math.max(...mockChartData.map(d => d.visitors));

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Traffic Analytics</h2>
        <div className="flex items-center space-x-2">
          <span className={`flex items-center text-sm ${previousPeriodChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {previousPeriodChange >= 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {Math.abs(previousPeriodChange)}% from last period
          </span>
        </div>
      </div>

      {/* Traffic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Daily Visitors</p>
              <p className="text-2xl font-bold text-white">{dailyVisitors}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Weekly Visitors</p>
              <p className="text-2xl font-bold text-white">{weeklyVisitors}</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-full">
              <ChartBarIcon className="w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Monthly Visitors</p>
              <p className="text-2xl font-bold text-white">{monthlyVisitors}</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full">
              <ChartBarIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{conversionRate}%</p>
            </div>
            <div className="p-2 bg-amber-500/20 rounded-full">
              <ChartBarIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-white mb-4">Weekly Traffic</h3>
        <div className="h-64 flex items-end space-x-2">
          {mockChartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t-sm" 
                style={{ 
                  height: `${(item.visitors / maxVisitors) * 100}%`,
                  minHeight: '10%'
                }}
              ></div>
              <div className="text-xs text-gray-400 mt-2">{item.day}</div>
              <div className="text-xs font-medium text-white">{item.visitors}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Traffic Sources</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-400">Direct</div>
            <div className="flex-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-white">65%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-400">Search</div>
            <div className="flex-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-white">20%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-400">Social</div>
            <div className="flex-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-white">10%</div>
          </div>
          <div className="flex items-center">
            <div className="w-32 text-sm text-gray-400">Referral</div>
            <div className="flex-1">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
            <div className="w-16 text-right text-sm font-medium text-white">5%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficAnalytics;
