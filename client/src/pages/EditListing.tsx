import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useVehicles } from '../hooks/useVehicles';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { Vehicle } from '../types/database';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

import { useAuth } from '../contexts/AuthContext';

const EditListing: React.FC = () => {
  const { profile } = useAuth();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { vehicles, isLoading: isLoadingVehicles, updateVehicle } = useVehicles();
  const { addPricePoint } = usePriceHistory(id || '');
  
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: 0,
    price: 0,
    mileage: 0,
    condition: 'used',
    description: '',
    location: '',
    images: [],
    status: 'active',
    specifications: {
      transmission: '',
      fuel_type: '',
      engine_size: '',
      color: '',
      doors: 0,
      seats: 0,
    },
    features: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  useEffect(() => {
    // Role-based access control
    if (profile && profile.role !== 'seller' && profile.role !== 'admin') {
      toast.error('You do not have permission to edit listings.');
      navigate('/');
      return;
    }

    if (id && vehicles) {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        setFormData(vehicle);
        setPreviewImages(vehicle.images);
      } else {
        toast.error('Vehicle not found');
        navigate('/my-listings');
      }
    }
  }, [id, vehicles]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: section === 'specifications' ? {
          ...prev.specifications,
          [field]: value,
        } : prev[section as keyof Vehicle],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);

    // Create preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    if (index < (formData.images?.length || 0)) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images?.filter((_, i) => i !== index),
      }));
    } else {
      const newImageIndex = index - (formData.images?.length || 0);
      setNewImages((prev) => prev.filter((_, i) => i !== newImageIndex));
    }
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...(prev.features || []), feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Only allow owner or admin
    if (profile && profile.role !== 'admin' && formData.profile_id !== profile.id) {
      toast.error('You do not have permission to edit this listing.');
      return;
    }

    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!id) throw new Error('No vehicle ID provided');

      // Upload new images
      const newImageUrls = await Promise.all(
        newImages.map(async (file) => {
          const fileName = `${id}/${Date.now()}-${file.name}`;
          const { data, error } = await supabase.storage
            .from('vehicle-images')
            .upload(fileName, file);

          if (error) throw error;
          return supabase.storage.from('vehicle-images').getPublicUrl(data.path).data.publicUrl;
        })
      );

      // Update vehicle listing
      const updatedVehicle = {
        ...formData,
        images: [...(formData.images || []), ...newImageUrls],
        updated_at: new Date().toISOString(),
      };

      await updateVehicle.mutateAsync({ id, ...updatedVehicle });
      
      // Track price change if price was updated
      if (formData.price !== vehicles?.find(v => v.id === id)?.price) {
        await addPricePoint.mutateAsync(formData.price || 0);
      }

      toast.success('Listing updated successfully');
      navigate('/my-listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVehicles) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Make</label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mileage</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
              >
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-700 hover:border-dark-accent transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <PhotoIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Add Photos</span>
              </div>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
            required
          />
        </div>

        {/* Specifications */}
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <input
                type="text"
                name="specifications.color"
                value={formData.specifications?.color || ''}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Transmission</label>
              <select
                name="specifications.transmission"
                value={formData.specifications?.transmission || ''}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
              >
                <option value="">Select Transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
                <option value="semi-automatic">Semi-Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fuel Type</label>
              <select
                name="specifications.fuel_type"
                value={formData.specifications?.fuel_type || ''}
                onChange={handleInputChange}
                className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
              >
                <option value="">Select Fuel Type</option>
                <option value="gasoline">Gasoline</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Features</h2>
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
                  checked={formData.features?.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="rounded border-gray-700 text-dark-accent focus:ring-dark-accent"
                />
                <span>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="px-6 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-dark-accent text-white rounded-lg hover:bg-dark-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListing; 