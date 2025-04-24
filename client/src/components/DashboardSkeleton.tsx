import React from 'react';

const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow h-32" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-lg shadow h-48" />
        <div className="bg-white rounded-lg shadow h-48" />
        <div className="bg-white rounded-lg shadow h-48" />
      </div>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow h-48" />
        <div className="bg-white rounded-lg shadow h-48" />
      </div>
    </div>
  </div>
);

export default DashboardSkeleton;
