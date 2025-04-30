import { useState } from 'react';

export interface CarData {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color?: string;
  imageUrl: string;
  rating: number;
}

const CarCard = ({ car }: { car: CarData }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Car Image */}
      <div className="relative h-48 bg-secondary">
        <img src={car.imageUrl} alt={`${car.year} ${car.make} ${car.model}`} className="h-full w-full object-cover" />

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
        >
          {isFavorite ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-5.201-3.41 8.856 8.856 0 01-2.351-5.452C3.968 7.657 7.122 4 11.5 4s7.532 3.657 7.532 8.033a8.855 8.855 0 01-2.351 5.452 15.247 15.247 0 01-5.201 3.41l-.022.012-.007.003-.001.001a.447.447 0 01-.43 0l-.001-.001z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>

        {/* Rating */}
        <div className="absolute top-2 left-2 bg-yellow-400 rounded-md px-1.5 py-0.5 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-900">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-semibold text-yellow-900 ml-0.5">{car.rating}</span>
        </div>
      </div>

      {/* Car Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{car.year} {car.make}</h3>
            <p className="text-sm text-muted-foreground">{car.model} {car.trim}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">${car.price.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Paiement estimé</p>
          </div>
        </div>

        {/* Car Specs */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="flex items-center text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{car.color || 'White'}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{car.fuelType}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{car.transmission}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-border flex justify-between gap-2">
          <button className="w-full py-1.5 text-sm font-medium text-blue-500 hover:text-blue-600">
            Voir détails
          </button>
          <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
            Envoyer une offre
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
