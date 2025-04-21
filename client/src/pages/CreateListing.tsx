import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Database } from '../types/database';

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface FormData {
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: 'new' | 'used' | 'certified';
  description: string;
  location: string;
  images: File[];
  specifications: {
    transmission: string;
    fuel_type: string;
    engine_size: string;
    color: string;
    doors: number;
    seats: number;
  };
  features: string[];
}

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    condition: 'used',
    description: '',
    location: '',
    images: [],
    specifications: {
      transmission: '',
      fuel_type: '',
      engine_size: '',
      color: '',
      doors: 4,
      seats: 5
    },
    features: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof FormData] as Record<string, any>),
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'price' || name === 'year' || name === 'mileage' || name === 'doors' || name === 'seats' 
          ? parseFloat(value) 
          : value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
      ...prev,
        images: Array.from(e.target.files as FileList)
    }));
    }
  };

  const handleFeatureChange = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload images to Supabase Storage
      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(fileName);

          return publicUrl;
        })
      );

      // Create vehicle listing
      const { error: dbError } = await supabase
        .from('vehicles')
        .insert({
          profile_id: user.id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        price: formData.price,
        mileage: formData.mileage,
          condition: formData.condition,
          description: formData.description,
        location: formData.location,
        images: imageUrls,
        specifications: formData.specifications,
          features: formData.features,
          status: 'active'
      });

      if (dbError) throw dbError;

      navigate('/my-listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Vehicle Listing</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Make
            </label>
              <input
                type="text"
              id="make"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
              <input
                type="text"
              id="model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
              <input
                type="number"
              id="year"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                required
              min="1900"
              max={new Date().getFullYear() + 1}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
              <input
                type="number"
              id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              min="0"
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
              Mileage
            </label>
              <input
                type="number"
              id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="certified">Certified</option>
            </select>
        </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
            <label htmlFor="specifications.transmission" className="block text-sm font-medium text-gray-700">
              Transmission
            </label>
              <select
              id="specifications.transmission"
                name="specifications.transmission"
                value={formData.specifications.transmission}
                onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="semi-automatic">Semi-Automatic</option>
              </select>
            </div>

            <div>
            <label htmlFor="specifications.fuel_type" className="block text-sm font-medium text-gray-700">
              Fuel Type
            </label>
              <select
              id="specifications.fuel_type"
              name="specifications.fuel_type"
              value={formData.specifications.fuel_type}
                onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Fuel Type</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

          <div>
            <label htmlFor="specifications.engine_size" className="block text-sm font-medium text-gray-700">
              Engine Size
            </label>
            <input
              type="text"
              id="specifications.engine_size"
              name="specifications.engine_size"
              value={formData.specifications.engine_size}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="specifications.color" className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="text"
              id="specifications.color"
              name="specifications.color"
              value={formData.specifications.color}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="specifications.doors" className="block text-sm font-medium text-gray-700">
              Number of Doors
            </label>
            <input
              type="number"
              id="specifications.doors"
              name="specifications.doors"
              value={formData.specifications.doors}
              onChange={handleInputChange}
              min="2"
              max="5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="specifications.seats" className="block text-sm font-medium text-gray-700">
              Number of Seats
            </label>
            <input
              type="number"
              id="specifications.seats"
              name="specifications.seats"
              value={formData.specifications.seats}
              onChange={handleInputChange}
              min="2"
              max="9"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Air Conditioning',
              'Power Steering',
              'Power Windows',
              'ABS',
              'Airbags',
              'Navigation System',
              'Bluetooth',
              'Backup Camera',
              'Parking Sensors',
              'Leather Seats',
              'Sunroof',
              'Premium Audio',
            ].map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="images"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload images</span>
                  <input
                    id="images"
                    name="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {formData.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formData.images.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="h-24 w-24 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing; 