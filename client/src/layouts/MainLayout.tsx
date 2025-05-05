import { ReactNode } from 'react';
import Navbar from '../components/navigation/Navbar';
import { useAuth } from '../contexts/AuthContext';
import AuthDebug from '../components/common/AuthDebug';

interface MainLayoutProps {
  children: ReactNode | ReactNode[];
}

export default function MainLayout({ children }: MainLayoutProps) {
  // const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navigation - Our new Navbar component will automatically show the correct version */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
      
      {/* Debug component to help diagnose auth issues */}
      <AuthDebug />
    </div>
  );
}