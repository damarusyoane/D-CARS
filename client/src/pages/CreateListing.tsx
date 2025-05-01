import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Database } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
  const { profile } = useAuth();
  const navigate = useNavigate();
  if (profile && profile.role !== 'seller' && profile.role !== 'admin') {
    alert('Vous n\'avez pas la permission de créer des annonces.');
    navigate('/');
    return null;
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<FormData>({
    initialValues: {
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
        seats: 5,
      },
      features: [],
    },
    validationSchema: Yup.object({
      make: Yup.string().required('Marque requise'),
      model: Yup.string().required('Modèle requis'),
      year: Yup.number()
        .required('Année requise')
        .min(1900, 'Année invalide')
        .max(new Date().getFullYear(), 'Année invalide'),
      price: Yup.number()
        .required('Prix requis')
        .min(0, 'Prix invalide'),
      mileage: Yup.number()
        .required('Kilométrage requis')
        .min(0, 'Kilométrage invalide'),
      condition: Yup.string().required('État requis'),
      description: Yup.string().required('Description requise'),
      location: Yup.string().required('Localisation requise'),
      specifications: Yup.object({
        transmission: Yup.string().required('Transmission requise'),
        fuel_type: Yup.string().required('Type de carburant requis'),
        engine_size: Yup.string().required('Taille du moteur requise'),
        color: Yup.string().required('Couleur requise'),
        doors: Yup.number()
          .required('Nombre de portes requis')
          .min(2, 'Nombre de portes invalide')
          .max(5, 'Nombre de portes invalide'),
        seats: Yup.number()
          .required('Nombre de places requis')
          .min(2, 'Nombre de places invalide')
          .max(9, 'Nombre de places invalide'),
      }),
      features: Yup.array(),
      images: Yup.array().min(1, 'Au moins une image est requise'),
    }),
    onSubmit: handleSubmit,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files as FileList);
      formik.setFieldValue('images', fileList);

      // Validate image file types
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
      const invalidFiles = fileList.filter((file) => !validTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        formik.setFieldError('images', 'Seules les images JPEG, PNG, WEBP et GIF sont autorisées');
      } else if (fileList.some((file) => file.size > 5 * 1024 * 1024)) {
        formik.setFieldError('images', 'Les images doivent être inférieures à 5 Mo');
      }
    }
  };

  const handleFeatureChange = (feature: string) => {
    const newFeatures = formik.values.features.includes(feature)
      ? formik.values.features.filter((f) => f !== feature)
      : [...formik.values.features, feature];

    formik.setFieldValue('features', newFeatures);
  };

  async function handleSubmit(values: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Authentication failed: ${authError.message}`);
      }

      if (!authData?.user) {
        throw new Error('Not authenticated - please log in again');
      }

      const user = authData.user;

      // 2. Upload images to Supabase Storage
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
          default:
            return 'application/octet-stream';
        }
      };

      // Define imageUrls with a default empty array in case no images are uploaded
      let imageUrls: string[] = [];

      // Only try to upload images if there are any
      if (values.images && values.images.length > 0) {
        try {
          imageUrls = await Promise.all(
            values.images.map(async (file) => {
              const fileExt = file.name.split('.').pop() || '';
              const fileName = `${user.id}/${Date.now()}-${file.name}`;

              const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vehicle-images')
                .upload(fileName, file, { contentType: getMimeType(fileExt) });

              if (uploadError) {
                throw new Error(`Image upload failed: ${uploadError.message}`);
              }

              // Get the public URL for the uploaded image
              const { data: publicUrl } = supabase.storage
                .from('vehicle-images')
                .getPublicUrl(fileName);

              return publicUrl.publicUrl;
            })
          );
        } catch (error) {
          throw new Error('Failed to upload images');
        }
      }

      // 3. Create the vehicle listing
      const { error: createError } = await supabase
        .from('vehicles')
        .insert([{
          make: values.make,
          model: values.model,
          year: values.year,
          price: values.price,
          mileage: values.mileage,
          condition: values.condition,
          description: values.description,
          location: values.location,
          images: imageUrls,
          specifications: {
            transmission: values.specifications.transmission,
            fuel_type: values.specifications.fuel_type,
            engine_size: values.specifications.engine_size,
            color: values.specifications.color,
            doors: values.specifications.doors,
            seats: values.specifications.seats,
          },
          features: values.features,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          profile_id: user.id
        }]);

      if (createError) {
        throw new Error(`Failed to create listing: ${createError.message}`);
      }

      toast.success('Your listing has been created successfully!');
      navigate('/dashboard/my-listings');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer une nouvelle annonce de véhicule</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">
              Marque
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formik.values.make}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                formik.touched.make && formik.errors.make ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {formik.touched.make && formik.errors.make && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.make}</p>
            )}
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formik.values.model}
              onChange={formik.handleChange}
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
              value={formik.values.year}
              onChange={formik.handleChange}
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
              value={formik.values.price}
              onChange={formik.handleChange}
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
              value={formik.values.mileage}
              onChange={formik.handleChange}
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
              value={formik.values.condition}
              onChange={formik.handleChange}
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
              value={formik.values.location}
              onChange={formik.handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          </label>
        
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
                  checked={formik.values.features.includes(feature)}
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
          {formik.values.images.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {formik.values.images.map((file, index) => (
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