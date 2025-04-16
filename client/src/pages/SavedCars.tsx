import React from 'react';
import Sidebar from '../components/Sidebar';
import CommonFooter from '../components/CommonFooter';

const SavedCars: React.FC = () => {
  const savedCars = [
    {
      id: 1,
      name: 'Tesla Model 3',
      year: '2021',
      price: '$42,900',
      image: 'https://images.unsplash.com/photo-1617704548623-340376564e68?q=80&w=1920&auto=format&fit=crop',
      location: 'San Francisco, CA',
      mileage: '10,056 mi',
      rating: 4.8,
    },
    {
      id: 2,
      name: 'BMW M4',
      year: '2022',
      price: '$54,000',
      image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1920&auto=format&fit=crop',
      location: 'Los Angeles, CA',
      mileage: '5,400 mi',
      rating: 4.9,
    },
    {
      id: 3,
      name: 'Mercedes-Benz S',
      year: '2019',
      price: '$75,000',
      image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d109?q=80&w=1920&auto=format&fit=crop',
      location: 'New York, NY',
      mileage: '22,345 mi',
      rating: 4.7,
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activePage="saved-cars" />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Saved Cars</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
              + Add New Listing
            </button>
          </div>
        </header>
        
        {/* Car Listings */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedCars.map((car) => (
              <div key={car.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                <div className="relative h-48">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-gray-900/50 p-1.5 rounded-full hover:bg-gray-900">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                  <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md font-medium">
                    {car.year}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{car.name}</h3>
                    <div className="flex items-center text-yellow-400">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm">{car.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-2xl font-bold text-white mb-3">{car.price}</p>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{car.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-5">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>{car.mileage}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="text-sm bg-transparent hover:bg-gray-700 text-white font-medium py-2 px-4 border border-gray-600 rounded">
                      View Details
                    </button>
                    <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <CommonFooter />
    </div>
  );
};

export default SavedCars;