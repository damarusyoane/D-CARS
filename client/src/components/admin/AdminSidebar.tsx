// client/src/components/admin/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  TruckIcon, // Changed from CarIcon
  ChartBarIcon,
  Cog6ToothIcon, // Updated to newer version
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tableau de Bord', href: '/admin', icon: HomeIcon },
  { name: 'Utilisateurs', href: '/admin', icon: UsersIcon },
  { name: 'Véhicules', href: '/admin', icon: TruckIcon }, // Updated icon
  { name: 'Analytiques', href: '/admin', icon: ChartBarIcon },
  { name: 'Paramètres', href: '/dashboard/settings', icon: Cog6ToothIcon }, // Updated icon
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-base-100 border-r border-base-300">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b border-base-300">
          <h1 className="text-xl font-bold text-base-content">Panneau d'Administration</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/70 hover:bg-base-200'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-primary' : 'text-base-content/50'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}