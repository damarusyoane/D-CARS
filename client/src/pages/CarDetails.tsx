import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  HeartIcon,
  ShareIcon,
  MapPinIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const CarDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - replace with API call
  const car = {
    id,
    title: '2021 Tesla Model 3 Long Range AWD',
    description: 'The Tesla Model 3 Long Range AWD is in excellent condition with low mileage. Features include Autopilot, Premium Interior Package, and 19" Sport Wheels. Clean title and service history available.',
    price: 42900,
    year: 2021,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range AWD',
    mileage: 15000,
    location: 'San Francisco, CA',
    seller: {
      id: '1',
      name: 'Alex Johnson',
      avatar: '/avatars/alex.jpg',
      rating: 4.8,
      memberSince: '2020',
      responseTime: '< 1 hour',
    },
    images: [
      '/cars/tesla-model-3-1.jpg',
      '/cars/tesla-model-3-2.jpg',
      '/cars/tesla-model-3-3.jpg',
    ],
    features: [
      'Autopilot',
      'Premium Interior',
      '19" Sport Wheels',
      'All-Wheel Drive',
      'Long Range Battery',
      'Glass Roof',
    ],
    specifications: {
      exterior: 'Pearl White',
      interior: 'Black',
      transmission: 'Automatic',
      drivetrain: 'All-Wheel Drive',
      fuelType: 'Electric',
      battery: '82 kWh',
      range: '358 miles',
    },
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === car.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? car.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Image Gallery */}
      <div className="relative h-[500px] mb-8 rounded-lg overflow-hidden">
        <img
          src={car.images[currentImageIndex]}
          alt={car.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {car.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        <button
          onClick={prevImage}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
        >
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
        >
          <ChevronRightIcon className="h-6 w-6 text-white" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-8">
          <div className="bg-dark-secondary rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">{car.title}</h1>
                <div className="flex items-center text-gray-400">
                  <MapPinIcon className="h-5 w-5 mr-1" />
                  {car.location}
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="p-2 rounded-full bg-dark-primary hover:bg-dark-accent/10"
                >
                  {isFavorite ? (
                    <HeartIconSolid className="h-6 w-6 text-red-500" />
                  ) : (
                    <HeartIcon className="h-6 w-6" />
                  )}
                </button>
                <button className="p-2 rounded-full bg-dark-primary hover:bg-dark-accent/10">
                  <ShareIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <p className="text-gray-300">{car.description}</p>
          </div>

          {/* Specifications */}
          <div className="bg-dark-secondary rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(car.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-dark-secondary rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Features</h2>
            <div className="grid grid-cols-2 gap-4">
              {car.features.map((feature) => (
                <div key={feature} className="flex items-center">
                  <span className="w-2 h-2 bg-dark-accent rounded-full mr-2" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="bg-dark-secondary rounded-lg p-6">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-3xl font-bold">${car.price.toLocaleString()}</span>
              <span className="text-gray-400">Market price</span>
            </div>
            <button className="w-full bg-dark-accent text-white py-3 rounded-lg font-medium hover:bg-dark-accent/90 mb-3">
              Contact Seller
            </button>
            <button className="w-full bg-transparent border border-dark-accent text-dark-accent py-3 rounded-lg font-medium hover:bg-dark-accent/10">
              Make Offer
            </button>
          </div>

          {/* Seller Card */}
          <div className="bg-dark-secondary rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={car.seller.avatar}
                alt={car.seller.name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <h3 className="font-medium">{car.seller.name}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="text-yellow-400 mr-1">★</span>
                  {car.seller.rating} • Member since {car.seller.memberSince}
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-400">
                <ClockIcon className="h-5 w-5 mr-2" />
                Response time: {car.seller.responseTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetails; 