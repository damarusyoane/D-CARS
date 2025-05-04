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

  const commonInputClass = `
    block w-full p-2 text-sm rounded-md 
    bg-gray-50 dark:bg-gray-800 
    border-gray-200 dark:border-gray-700 
    focus:ring-2 focus:ring-primary-500 
    focus:border-transparent 
    transition-all 
    text-gray-900 dark:text-gray-100 
    placeholder-gray-500 dark:placeholder-gray-400
  `;

  useEffect(() => {
    // Role-based access control
    if (profile && profile.role !== 'seller' && profile.role !== 'admin') {
      toast.error('Vous n\'avez pas la permission de modifier les annonces.');
      navigate('/');
      return;
    }

    if (id && vehicles) {
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        setFormData(vehicle);
        setPreviewImages(vehicle.images);
      } else {
        toast.error('Véhicule non trouvé');
        navigate('/dashboard/my-listings');
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
      toast.error('Vous n\'avez pas la permission de modifier cette annonce.');
      return;
    }

    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!id) throw new Error('Aucun ID de véhicule fourni');

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

      toast.success('Annonce mise à jour avec succès');
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'annonce:', error);
      toast.error('Échec de la mise à jour de l\'annonce');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVehicles) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Modifier l'annonce
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Informations de base
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marque
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleInputChange}
                className={commonInputClass}
                required
                placeholder="Ex : Toyota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Modèle
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                className={commonInputClass}
                required
                placeholder="Ex : Camry"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Année
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className={commonInputClass}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prix (€)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={commonInputClass}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kilométrage
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                className={commonInputClass}
                required
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={commonInputClass}
              >
                <option value="active">Actif</option>
                <option value="sold">Vendu</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Images
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewImages.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`Aperçu ${index + 1}`} 
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                <PhotoIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Ajouter des Photos</span>
              </div>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Description
          </h2>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="Détails supplémentaires sur le véhicule"
            className={commonInputClass}
            required
          />
        </div>

        {/* Specifications */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Caractéristiques techniques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <input
                type="text"
                name="specifications.color"
                value={formData.specifications?.color || ''}
                onChange={handleInputChange}
                placeholder="Ex : Noir Métallisé"
                className={commonInputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transmission
              </label>
              <select
                name="specifications.transmission"
                value={formData.specifications?.transmission || ''}
                onChange={handleInputChange}
                className={commonInputClass}
              >
                <option value="">Sélectionner la transmission</option>
                <option value="automatic">Automatique</option>
                <option value="manual">Manuelle</option>
                <option value="semi-automatic">Semi-Automatique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de Carburant
              </label>
              <select
                name="specifications.fuel_type"
                value={formData.specifications?.fuel_type || ''}
                onChange={handleInputChange}
                className={commonInputClass}
              >
                <option value="">Sélectionner le type de carburant</option>
                <option value="gasoline">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Électrique</option>
                <option value="hybrid">Hybride</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Équipements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Climatisation',
              'Direction Assistée',
              'Vitres Électriques',
              'Freins ABS',
              'Airbags',
              'Système de Navigation',
              'Bluetooth',
              'Caméra de Recul',
              'Capteurs de Stationnement',
              'Sièges en Cuir',
              'Toit Ouvrant',
              'Audio Premium',
            ].map((feature) => (
              <label key={feature} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.features?.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/my-listings')}
            className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 
              border border-transparent rounded-md 
              text-sm font-medium text-white 
              bg-primary-600 hover:bg-primary-700 
              focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary-500 
              disabled:opacity-50 
              transition-colors
              max-w-xs"
          >
            {isSubmitting ? 'Sauvegarde en cours...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListing;