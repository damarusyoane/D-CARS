import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-[600px] bg-gradient-to-r from-purple-900 to-purple-800 overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Background car image would be here */}
      <div className="absolute inset-0 bg-cover bg-center" 
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920&auto=format&fit=crop')" }}>
      </div>

      {/* Content container */}
      <div className="relative h-full flex flex-col justify-center items-center px-4 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Welcome to your Car <span className="text-red-500">Destination</span>
        </h1>
        <p className="text-xl text-white text-center mb-8 max-w-2xl">
          Find your perfect ride with our vast selection of premium vehicles
        </p>

        {/* Search section */}
        <div className="w-full max-w-4xl bg-white rounded-lg p-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Makes</option>
                <option>Audi</option>
                <option>BMW</option>
                <option>Mercedes</option>
                <option>Ford</option>
                <option>Toyota</option>
              </select>
            </div>
            <div className="flex-1">
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Models</option>
                <option>SUV</option>
                <option>Sedan</option>
                <option>Hatchback</option>
                <option>Convertible</option>
              </select>
            </div>
            <div className="flex-1">
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Price Range</option>
                <option>$0 - $10,000</option>
                <option>$10,000 - $20,000</option>
                <option>$20,000 - $30,000</option>
                <option>$30,000+</option>
              </select>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg">
              Search
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg">
              Advanced
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;