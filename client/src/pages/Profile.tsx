import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  UserCircleIcon,
  CameraIcon,
  PhoneIcon,
  EnvelopeIcon,

} from '@heroicons/react/24/outline';

type Profile = Database['public']['Tables']['profiles']['Row'];

// Mock user data
const userData = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+237 123 456 789',
  location: 'Douala, Cameroon',
  avatar: '/images/avatars/user-1.jpg',
  bio: 'Car enthusiast and collector. I specialize in luxury and sports cars with low mileage and excellent condition.',
  memberSince: '2024-01-01',
  totalListings: 5,
  completedSales: 12,
  rating: 4.8,
  reviews: [
    {
      id: 1,
      author: {
        name: 'Jane Smith',
        avatar: '/images/avatars/user-2.jpg',
      },
      rating: 5,
      comment: 'Great seller! Very professional and responsive.',
      date: '2024-02-15',
    },
    // Add more reviews here
  ],
};

export default function Profile() {
  const { t } = useTranslation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !isAuthLoading,
  });

  const updateProfile = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user?.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);
        if (error.code === '23505') {
          throw new Error('Email already exists');
        } else if (error.code === '23514') {
          throw new Error('Invalid data format');
        } else if (error.code === '42501') {
          throw new Error('Permission denied');
        }
        throw error;
      }

      if (!data) {
        throw new Error('No data returned after update');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast.error(error.message || t('profile.updateError'));
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) {
        throw new Error('User ID is required');
      }

      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      console.log('Uploading file to path:', filePath);

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        if (uploadError.message.includes('duplicate')) {
          throw new Error('File already exists');
        }
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      // Update the profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      console.log('Upload successful, updating profile with URL:', publicUrl);
      queryClient.setQueryData(['profile', user?.id], (oldData: any) => ({
        ...oldData,
        avatar_url: publicUrl
      }));
      toast.success(t('profile.avatarUpdateSuccess'));
    },
    onError: (error: Error) => {
      console.error('Avatar upload error:', error);
      toast.error(error.message || t('profile.avatarUpdateError'));
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar.mutate(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    // Validate form data
    const full_name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone_number = formData.get('phone') as string;

    if (!full_name || !email) {
      toast.error(t('profile.requiredFields'));
      return;
    }

    const updatedProfile = {
      full_name,
      email,
      phone_number: phone_number || null,
    };

    updateProfile.mutate(updatedProfile as Partial<Profile>);
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  {isUploading ? (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : profile?.avatar_url ? (
                    <>
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="h-32 w-32 rounded-full mx-auto object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', e);
                          e.currentTarget.src = '/default-avatar.png';
                        }}
                        onLoad={() => console.log('Image loaded successfully')}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        Current URL: {profile.avatar_url}
                      </div>
                    </>
                  ) : (
                    <UserCircleIcon className="h-32 w-32 text-gray-400" />
                  )}
                  <label className="absolute bottom-0 right-0 ...">
  <input
    type="file"
    accept="image/*"
    onChange={handleAvatarChange}
    className="hidden"
    disabled={isUploading}
    aria-label="Upload profile picture"
    title="Upload profile picture"
  />
  <CameraIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" title="Upload profile picture" />
</label>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                  {profile?.full_name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(profile?.created_at ?? '').toLocaleDateString()}
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  {profile?.email}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  {profile?.phone_number || 'Not provided'}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {userData.totalListings}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.listings')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {userData.completedSales}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.sales')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {userData.rating}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.rating')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('profile.information')}
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  {isEditing ? t('common.cancel') : t('common.edit')}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('profile.name')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      defaultValue={profile?.full_name}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('profile.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      defaultValue={profile?.email}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t('profile.phone')}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      defaultValue={profile?.phone_number ?? ''}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300">
                    {userData.bio}
                  </p>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                {t('profile.reviews')}
              </h3>
              <div className="space-y-6">
                {userData.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-start">
                      <img
                        src={review.author.avatar}
                        alt={review.author.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {review.author.name}
                          </h4>
                          <span className="mx-2 text-gray-500 dark:text-gray-400">
                            •
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating
                                  ? 'text-yellow-400'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 