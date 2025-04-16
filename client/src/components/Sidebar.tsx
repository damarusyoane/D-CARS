import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const navigation = [
    { name: 'My Listings', path: '/my-listings', icon: 'car' },
    { name: 'Saved Cars', path: '/saved-cars', icon: 'heart' },
    { name: 'Dashboard', path: '/dashboard', icon: 'chart-bar' },
    { name: 'Messages', path: '/messages', icon: 'chat' },
    { name: 'Transaction History', path: '/transactions', icon: 'receipt' },
    { name: 'Account Settings', path: '/settings', icon: 'cog' },
    { name: 'Sign Out', path: '/logout', icon: 'logout' }
  ];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'car':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1H3V5h7v4h4v6h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1v-5a1 1 0 00-.293-.707l-4-4A1 1 0 0015 4h-2a1 1 0 00-1 1v3H3z" />
          </svg>
        );
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case 'chart-bar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'chat':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        );
      case 'receipt':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'cog':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        );
      case 'logout':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm8.293 4.293a1 1 0 011.414 0L15 8.586l.707-.707A1 1 0 0117 9.172V15a1 1 0 01-1 1H4a1 1 0 01-1-1V9.172a1 1 0 011.707-.707L5 8.586l2.293-2.293a1 1 0 011.414 0L10 7.586l1.293-1.293z" clipRule="evenodd" />
            <path d="M11 12a1 1 0 10-2 0v4a1 1 0 102 0v-4z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-60 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 flex items-center">
        <div className="text-lg font-bold text-blue-500">AutoMarket</div>
      </div>

      {/* User Profile Summary */}
      <div className="px-4 py-6 flex flex-col items-center border-b border-gray-800">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="font-semibold text-lg">Alex Johnson</h3>
        <p className="text-gray-400 text-sm">San Francisco, CA</p>
        
        <div className="flex items-center mt-2 text-sm text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>4.8 (156 reviews)</span>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">Profile</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded">Edit Profile</button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="py-4 flex-1">
        <ul>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center py-2 px-4 ${
                  activePage === item.name.toLowerCase().replace(' ', '-')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="mr-3">{renderIcon(item.icon)}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;