import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'rent' | 'buy' | 'sell'>('search');
  const location = useLocation();

  return (
    <header className="flex items-center justify-between bg-card p-3 border-b border-border">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold text-blue-500 mr-6">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-1">
              <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h8.25c1.035 0 1.875-.84 1.875-1.875V15z" />
              <path d="M8.25 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0zM15.75 6.75a.75.75 0 0 0-.75.75v11.25c0 .087.015.17.042.248a3 3 0 0 1 5.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 0 0-3.732-10.104 1.837 1.837 0 0 0-1.47-.725H15.75z" />
              <path d="M19.5 19.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z" />
            </svg>
            AutoMarket
          </span>
        </Link>
        <div className="hidden md:flex space-x-4">
          <NavButton active={activeTab === 'search'} onClick={() => setActiveTab('search')}>Search</NavButton>
          <NavButton active={activeTab === 'rent'} onClick={() => setActiveTab('rent')}>Rent</NavButton>
          <NavButton active={activeTab === 'buy'} onClick={() => setActiveTab('buy')}>Buy</NavButton>
          <NavButton active={activeTab === 'sell'} onClick={() => setActiveTab('sell')}>Sell</NavButton>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-2 rounded-full hover:bg-secondary text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-secondary text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <Link
          to="/messages"
          className={`p-2 rounded-full hover:bg-secondary text-foreground ${location.pathname === '/messages' ? 'bg-secondary/70' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </Link>
        <button className="p-2 rounded-full hover:bg-secondary text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
          <span>JD</span>
        </div>
      </div>
    </header>
  );
};

const NavButton = ({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium ${active ? 'text-blue-500' : 'text-gray-400 hover:text-gray-300'}`}
    >
      {children}
    </button>
  );
};

export default Header;
