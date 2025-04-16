import { useState } from 'react';
import CarCard, { type CarData } from './CarCard';

interface CarListingsGridProps {
  cars: CarData[];
}

const CarListingsGrid = ({ cars }: CarListingsGridProps) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('relevance');

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Find Your Perfect Car</h1>
          <p className="text-muted-foreground text-sm">{cars.length} vehicles found</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 ${viewType === 'grid' ? 'bg-secondary' : 'bg-card'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 ${viewType === 'list' ? 'bg-secondary' : 'bg-card'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-card border border-border rounded-md p-2 pr-8 text-sm"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="year_new">Year: Newest First</option>
              <option value="year_old">Year: Oldest First</option>
              <option value="mileage_low">Mileage: Low to High</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Car Grid */}
      <div className={`grid gap-6 ${viewType === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {cars.map(car => (
          <CarCard key={car.id} car={car} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center gap-2">
        <button className="px-3 py-1 border border-border rounded-md bg-card text-sm">Previous</button>
        <button className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm">1</button>
        <button className="px-3 py-1 rounded-md hover:bg-secondary text-sm">2</button>
        <button className="px-3 py-1 rounded-md hover:bg-secondary text-sm">3</button>
        <span className="px-1">...</span>
        <button className="px-3 py-1 rounded-md hover:bg-secondary text-sm">10</button>
        <button className="px-3 py-1 border border-border rounded-md bg-card text-sm">Next</button>
      </div>
    </div>
  );
};

export default CarListingsGrid;
