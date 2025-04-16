import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Sidebar from '../components/filters/Sidebar';
import CarListingsGrid from '../components/CarListingsGrid';
import type { CarData } from '../components/CarCard';

// Sample car data
const carData: CarData[] = [
  {
    id: '1',
    year: 2021,
    make: 'Tesla',
    model: 'Model 3',
    trim: 'Long Range',
    price: 42800,
    mileage: 12500,
    fuelType: 'Electric',
    transmission: 'Automatic',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.9
  },
  {
    id: '2',
    year: 2020,
    make: 'BMW',
    model: '3 Series',
    trim: '330i',
    price: 35000,
    mileage: 25000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Black',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
    rating: 4.7
  },
  {
    id: '3',
    year: 2019,
    make: 'Mercedes',
    model: 'C-Class',
    trim: 'C300',
    price: 33500,
    mileage: 28000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Silver',
    imageUrl: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1425&q=80',
    rating: 4.6
  },
  {
    id: '4',
    year: 2022,
    make: 'Ford',
    model: 'Mustang GT',
    price: 48500,
    mileage: 5000,
    fuelType: 'Gasoline',
    transmission: 'Manual',
    color: 'Red',
    imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5f89018c8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    rating: 4.8
  },
  {
    id: '5',
    year: 2020,
    make: 'Audi',
    model: 'Q7',
    price: 51700,
    mileage: 18000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Blue',
    imageUrl: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.5
  },
  {
    id: '6',
    year: 2021,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'Hybrid',
    price: 32900,
    mileage: 15000,
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    color: 'Green',
    imageUrl: 'https://images.unsplash.com/photo-1581381812727-e1e8d53520f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    rating: 4.4
  },
  {
    id: '7',
    year: 2022,
    make: 'Honda',
    model: 'Accord',
    trim: 'Sport',
    price: 29800,
    mileage: 8000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'White',
    imageUrl: 'https://images.unsplash.com/photo-1632943122861-64a5dbc3e0ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    rating: 4.5
  },
  {
    id: '8',
    year: 2021,
    make: 'Jeep',
    model: 'Wrangler',
    trim: 'Unlimited',
    price: 38900,
    mileage: 22000,
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    color: 'Orange',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    rating: 4.6
  }
];

const HomePage = () => {
  return (
    <Layout>
      <div className="flex h-full">
        <Sidebar />
        <CarListingsGrid cars={carData} />
      </div>
    </Layout>
  );
};

export default HomePage;
