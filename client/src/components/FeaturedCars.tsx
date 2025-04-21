import React from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

interface CarCardProps {
  id: string;
  image: string;
  name: string;
  price: number;
  year: number;
  mileage: number;
  location: string;
}

const CarCard: React.FC<CarCardProps> = ({ id, image, name, price, year, mileage, location }) => (
  <Link to={`/cars/${id}`} className="group">
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
          {name}
        </h3>
        <p className="text-gray-600">
          {year} • {mileage.toLocaleString()} miles
        </p>
        <p className="text-gray-500 text-sm">{location}</p>
        <div className="mt-2">
          <span className="text-xl font-bold text-primary-600">
            ${price.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const FeaturedCars: React.FC = () => {
  const { vehicles } = useVehicles();
  const featuredVehicles = vehicles?.slice(0, 6) || [];

  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Featured Cars</h2>
          <p className="text-gray-600 mb-8">Explore our latest featured vehicles</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map(vehicle => (
              <CarCard
                key={vehicle.id}
                id={vehicle.id}
                image={vehicle.images[0]}
                name={`${vehicle.make} ${vehicle.model}`}
                price={vehicle.price}
                year={vehicle.year}
                mileage={vehicle.mileage}
                location={vehicle.location}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/cars?featured=true"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              View All Featured
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCars;