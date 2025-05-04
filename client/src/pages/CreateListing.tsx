import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';



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
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (profile && profile.role !== 'seller' && profile.role !== 'admin') {
    toast.error('Vous n\'avez pas la permission de créer des annonces.');
    navigate('/');
    return null;
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
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
        [name]: type === 'number'
          ? (value === '' ? '' : Number(value))
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
      if (!user) throw new Error('Non authentifié');

      // Upload images to Supabase Storage
      const getMimeType = (ext: string) => {
        switch (ext.toLowerCase()) {
          case 'jpg':
          case 'jpeg':
            return 'image/jpeg';
          case 'png':
            return 'image/png';
          case 'gif':
            return 'image/gif';
          case 'webp':
            return 'image/webp';
          case 'bmp':
            return 'image/bmp';
          default:
            return 'application/octet-stream';
        }
      };

      const imageUrls = await Promise.all(
        formData.images.map(async (file) => {
          const fileExt = file.name.split('.').pop() || '';
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('vehicle-images')
            .upload(fileName, file, { contentType: getMimeType(fileExt) });
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
          status: 'pending'
        });

      if (dbError) throw dbError;

      toast.success('Annonce créée avec succès');
      navigate('/dashboard/my-listings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Créer une nouvelle annonce de véhicule
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Marque
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              required
              placeholder="Ex : Toyota"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              required
              placeholder="Ex : Camry"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Année
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
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix (€)
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
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kilométrage
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              required
              min="0"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              État
            </label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
              className={commonInputClass}
            >
              <option value="new">Neuf</option>
              <option value="used">Occasion</option>
              <option value="certified">Certifié</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Localisation
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            placeholder="Ville, Région"
            className={commonInputClass}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Détails supplémentaires sur le véhicule"
            className={commonInputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="specifications.transmission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transmission
            </label>
            <select
              id="specifications.transmission"
              name="specifications.transmission"
              value={formData.specifications.transmission}
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
            <label htmlFor="specifications.fuel_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de Carburant
            </label>
            <select
              id="specifications.fuel_type"
              name="specifications.fuel_type"
              value={formData.specifications.fuel_type}
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

          <div>
            <label htmlFor="specifications.engine_size" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cylindrée
            </label>
            <input
              type="text"
              id="specifications.engine_size"
              name="specifications.engine_size"
              value={formData.specifications.engine_size}
              onChange={handleInputChange}
              placeholder="Ex : 2.0L"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="specifications.color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Couleur
            </label>
            <input
              type="text"
              id="specifications.color"
              name="specifications.color"
              value={formData.specifications.color}
              onChange={handleInputChange}
              placeholder="Ex : Noir Métallisé"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="specifications.doors" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de Portes
            </label>
            <input
              type="number"
              id="specifications.doors"
              name="specifications.doors"
              value={formData.specifications.doors}
              onChange={handleInputChange}
              min="2"
              max="5"
              className={commonInputClass}
            />
          </div>

          <div>
            <label htmlFor="specifications.seats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de Sièges
            </label>
            <input
              type="number"
              id="specifications.seats"
              name="specifications.seats"
              value={formData.specifications.seats}
              onChange={handleInputChange}
              min="2"
              max="9"
              className={commonInputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Caractéristiques
          </label>
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
                  checked={formData.features.includes(feature)}
                  onChange={() => handleFeatureChange(feature)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Images
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="images"
                  className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <span>Télécharger des images</span>
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
                <p className="pl-1">ou glisser-déposer</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF jusqu'à 10 Mo
              </p>
            </div>
          </div>
          {formData.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formData.images.map((file, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(file)}
                  alt={`Aperçu ${index + 1}`}
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
            className="w-full flex justify-center py-2 px-4 
              border border-transparent rounded-md 
              text-sm font-medium text-white 
              bg-primary-600 hover:bg-primary-700 
              focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary-500 
              disabled:opacity-50 
              transition-colors"
          >
            {isSubmitting ? 'Création en cours...' : 'Créer l\'annonce'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;