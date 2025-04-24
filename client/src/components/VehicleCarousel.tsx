import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  status: string;
  images: string[];
}

interface VehicleCarouselProps {
  vehicles: Vehicle[];
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = ({ vehicles }) => {
  // Simple horizontal scroll carousel (replace with a library for more features if desired)
  return (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
        {vehicles.map((vehicle) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-w-[320px] max-w-xs card bg-base-100 shadow-card hover:shadow-card-hover transition-shadow"
          >
            <figure className="relative h-48">
              <img
                src={vehicle.images[0]}
                alt={vehicle.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className="badge badge-primary">
                  {vehicle.status}
                </span>
              </div>
            </figure>
            <div className="card-body">
              <h3 className="card-title">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-base-content/70">
                {vehicle.year} • {vehicle.mileage.toLocaleString()} miles
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  ${vehicle.price.toLocaleString()}
                </span>
                <Link
                  to={`/vehicles/${vehicle.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VehicleCarousel;
