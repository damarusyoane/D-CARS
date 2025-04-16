import { useState } from 'react';

const Sidebar = () => {
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 5000, max: 100000 });
  const [mileage, setMileage] = useState<{ min: number; max: number }>({ min: 0, max: 150000 });
  const [yearRange, setYearRange] = useState<{ min: number; max: number }>({ min: 2020, max: 2023 });

  return (
    <div className="w-64 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        {/* Listing Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Listing Type</h3>
          <div className="space-y-2">
            <FilterCheckbox id="all-cars" label="All Cars" checked />
            <FilterCheckbox id="new-cars" label="New Cars" />
            <FilterCheckbox id="used-cars" label="Used Cars" />
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Price Range</h3>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="w-full">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm rounded bg-secondary border border-border"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="w-full">
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm rounded bg-secondary border border-border"
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="150000"
            step="1000"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
            className="w-full h-1 bg-secondary rounded appearance-none cursor-pointer"
          />
        </div>

        {/* Any Make */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Any Make</h3>
          <div className="relative">
            <select className="w-full p-2 text-sm rounded bg-secondary border border-border appearance-none">
              <option>Any Make</option>
              <option>Tesla</option>
              <option>BMW</option>
              <option>Ford</option>
              <option>Audi</option>
              <option>Toyota</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Any Model */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Any Model</h3>
          <div className="relative">
            <select className="w-full p-2 text-sm rounded bg-secondary border border-border appearance-none">
              <option>Any Model</option>
              <option>Model 3</option>
              <option>Model S</option>
              <option>3 Series</option>
              <option>Mustang GT</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Year Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Year</h3>
          <div className="flex items-center justify-between gap-2">
            <div className="w-full">
              <select className="w-full p-2 text-sm rounded bg-secondary border border-border appearance-none">
                <option>2020</option>
                <option>2021</option>
                <option>2022</option>
                <option>2023</option>
              </select>
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="w-full">
              <select className="w-full p-2 text-sm rounded bg-secondary border border-border appearance-none">
                <option>2023</option>
                <option>2022</option>
                <option>2021</option>
                <option>2020</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mileage */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Mileage</h3>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="w-full">
              <input
                type="number"
                value={mileage.min}
                onChange={(e) => setMileage({ ...mileage, min: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm rounded bg-secondary border border-border"
              />
            </div>
            <span className="text-muted-foreground">to</span>
            <div className="w-full">
              <input
                type="number"
                value={mileage.max}
                onChange={(e) => setMileage({ ...mileage, max: Number(e.target.value) })}
                className="w-full px-2 py-1 text-sm rounded bg-secondary border border-border"
              />
            </div>
          </div>
        </div>

        {/* Fuel Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Fuel Type</h3>
          <div className="space-y-2">
            <FilterCheckbox id="electric" label="Electric" />
            <FilterCheckbox id="hybrid" label="Hybrid" />
            <FilterCheckbox id="gasoline" label="Gasoline" />
            <FilterCheckbox id="diesel" label="Diesel" />
          </div>
        </div>

        {/* Transmission */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Transmission</h3>
          <div className="space-y-2">
            <FilterCheckbox id="automatic" label="Automatic" />
            <FilterCheckbox id="manual" label="Manual" />
          </div>
        </div>

        {/* Body Type */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Body Type</h3>
          <div className="space-y-2">
            <FilterCheckbox id="sedan" label="Sedan" />
            <FilterCheckbox id="suv" label="SUV" />
            <FilterCheckbox id="coupe" label="Coupe" />
            <FilterCheckbox id="pickup" label="Pickup" />
            <FilterCheckbox id="hatchback" label="Hatchback" />
          </div>
        </div>

        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
          Apply Filters
        </button>
      </div>
    </div>
  );
};

const FilterCheckbox = ({ id, label, checked = false }: { id: string; label: string; checked?: boolean }) => {
  const [isChecked, setIsChecked] = useState(checked);

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
        className="h-4 w-4 text-blue-600 rounded border-border focus:ring-0 focus:ring-offset-0 bg-secondary"
      />
      <label htmlFor={id} className="ml-2 text-sm">
        {label}
      </label>
    </div>
  );
};

export default Sidebar;
