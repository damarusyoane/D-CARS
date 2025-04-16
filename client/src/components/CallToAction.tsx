import React from 'react';

const CallToAction: React.FC = () => {
  return (
    <div className="bg-blue-600 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't miss our latest deals!
          </h2>
          <p className="text-blue-100 mb-8">
            Subscribe to our newsletter and be the first to know about new car listings, exclusive promotions, and automotive tips.
          </p>
          
          <div className="flex flex-col md:flex-row gap-2 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;