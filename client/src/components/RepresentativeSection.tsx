import React from 'react';

const RepresentativeSection: React.FC = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2">
            <div className="rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=1920&auto=format&fit=crop" 
                alt="Dealership Representative" 
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Are you ready to buy the perfect car?</h2>
            <p className="text-gray-600 mb-6">
              Our dedicated team of automobile experts is here to help you find the perfect vehicle 
              that matches your lifestyle and budget. With years of industry experience, we ensure 
              a smooth buying process from start to finish.
            </p>
            <p className="text-gray-600 mb-8">
              Whether you're looking for a family car, a luxury vehicle, or an economical option, 
              we have the expertise to guide you through the entire process and answer all your questions.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg">
              Contact Us Today
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepresentativeSection;