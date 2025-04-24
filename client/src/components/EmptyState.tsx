import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <div className="text-lg text-gray-500 mb-2">{message}</div>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
