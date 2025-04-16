import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-transparent z-50 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white font-bold text-xl">D-CARS</div>
        <div className="hidden md:flex space-x-6">
          <a href="#" className="text-white hover:text-gray-300">Home</a>
          <a href="#" className="text-white hover:text-gray-300">Buy Cars</a>
          <a href="#" className="text-white hover:text-gray-300">Sell Car</a>
          <a href="#" className="text-white hover:text-gray-300">About Us</a>
          <a href="#" className="text-white hover:text-gray-300">Contact</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-white hover:text-gray-300">Sign In</button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Sign Up</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;