import React from 'react';

interface CarCardProps {
  image: string;
  name: string;
  price: string;
  year: string;
  mileage: string;
  location: string;
}

const CarCard: React.FC<CarCardProps> = ({ image, name, price, year, mileage, location }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-blue-600 text-white text-sm font-semibold px-2 py-1 rounded">
          {price}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{name}</h3>
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <span className="mr-3">{year}</span>
          <span>{mileage}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
      </div>
    </div>
  );
};

const FeaturedCars: React.FC = () => {
  const featuredCars = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1920&auto=format&fit=crop",
      name: "BMW 3 Series",
      price: "$45,000",
      year: "2023",
      mileage: "10,000 mi",
      location: "Miami, FL"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=1920&auto=format&fit=crop",
      name: "Mercedes C-Class",
      price: "$48,500",
      year: "2022",
      mileage: "15,000 mi",
      location: "Dallas, TX"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop",
      name: "Ford Mustang",
      price: "$38,900",
      year: "2023",
      mileage: "5,000 mi",
      location: "Chicago, IL"
    },
  ];

  const popularCars = [
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1920&auto=format&fit=crop",
      name: "Audi A4",
      price: "$42,000",
      year: "2022",
      mileage: "12,000 mi",
      location: "Seattle, WA"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1920&auto=format&fit=crop",
      name: "Toyota Camry",
      price: "$29,500",
      year: "2023",
      mileage: "8,000 mi",
      location: "Phoenix, AZ"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1920&auto=format&fit=crop",
      name: "Tesla Model 3",
      price: "$52,000",
      year: "2022",
      mileage: "6,000 mi",
      location: "San Francisco, CA"
    },
  ];

  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        {/* Featured Cars Section */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Featured Cars</h2>
          <p className="text-gray-600 mb-8">Explore our latest featured vehicles</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCars.map(car => (
              <CarCard
                key={car.id}
                image={car.image}
                name={car.name}
                price={car.price}
                year={car.year}
                mileage={car.mileage}
                location={car.location}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600 font-medium px-6 py-2 rounded-lg transition-colors duration-300">
              View All Featured
            </button>
          </div>
        </div>

        {/* Popular Cars Section */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Popular Used Cars</h2>
          <p className="text-gray-600 mb-8">Discover our top-rated used vehicles</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularCars.map(car => (
              <CarCard
                key={car.id}
                image={car.image}
                name={car.name}
                price={car.price}
                year={car.year}
                mileage={car.mileage}
                location={car.location}
              />
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="bg-transparent hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-600 font-medium px-6 py-2 rounded-lg transition-colors duration-300">
              View All Popular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCars;