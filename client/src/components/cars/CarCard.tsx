import React from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface CarCardProps {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  location: string;
  imageUrl: string;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  rating?: number;
  sellerName?: string;
  sellerAvatar?: string;
}

const CarCard: React.FC<CarCardProps> = ({
  id,
  title,
  year,
  make,
  model,
  price,
  mileage,
  location,
  imageUrl,
  isFavorite = false,
  onFavoriteClick,
  rating,
  sellerName,
  sellerAvatar,
}) => {
  return (
    <div className="bg-dark-secondary rounded-lg overflow-hidden border border-gray-700 hover:border-dark-accent transition-colors">
      <div className="relative">
        <Link to={`/cars/${id}`}>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </Link>
        <button
          onClick={onFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-white" />
          )}
        </button>
        {rating && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/50 text-white text-sm flex items-center">
            <span className="text-yellow-400 mr-1">★</span>
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/cars/${id}`}>
            <h3 className="text-lg font-semibold hover:text-dark-accent">
              {year} {make} {model}
            </h3>
          </Link>
          <span className="text-lg font-bold text-dark-accent">
            XAF {price.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <span>{mileage.toLocaleString()} km</span>
            <span className="mx-2">•</span>
            <span>{location}</span>
          </div>

          {sellerName && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <img
                  src={sellerAvatar}
                  alt={sellerName}
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm">{sellerName}</span>
              </div>
              <Link
                to={`/messages/new?car=${id}`}
                className="p-2 text-gray-400 hover:text-white"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarCard; 