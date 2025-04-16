import React from 'react';

const BrandSection: React.FC = () => {
  const brands = [
    {
      id: 1,
      name: 'Audi',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/audi.png'
    },
    {
      id: 2,
      name: 'Ford',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/ford.png'
    },
    {
      id: 3,
      name: 'Mercedes-Benz',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/mercedes.png'
    },
    {
      id: 4,
      name: 'BMW',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/bmw.png'
    },
    {
      id: 5,
      name: 'Toyota',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/toyota.png'
    },
    {
      id: 6,
      name: 'Volkswagen',
      logo: 'https://www.car-logos.org/wp-content/uploads/2011/09/volkswagen.png'
    }
  ];

  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-10">Browse By Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-lg transition-shadow duration-300"
            >
              <img 
                src={brand.logo} 
                alt={`${brand.name} logo`} 
                className="h-16 w-auto object-contain mb-4"
              />
              <p className="text-gray-800 font-medium">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSection;