import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_email: boolean;
    show_phone: boolean;
  };
}

export default function UserSettings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (updatedProfile: Partial<UserProfile>) => {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast.success(t('settings.profileUpdated'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  // Upload avatar mutation
  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
      toast.success(t('settings.avatarUpdated'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
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
    
    const updatedProfile = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      notification_preferences: {
        email: formData.get('email_notifications') === 'on',
        push: formData.get('push_notifications') === 'on',
        sms: formData.get('sms_notifications') === 'on',
      },
      privacy_settings: {
        profile_visibility: formData.get('profile_visibility') as 'public' | 'private' | 'friends',
        show_email: formData.get('show_email') === 'on',
        show_phone: formData.get('show_phone') === 'on',
      },
    };

    updateProfile.mutate(updatedProfile);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('settings.title')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  alt={profile?.full_name}
                  className="h-24 w-24 rounded-full object-cover"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-sm cursor-pointer"
                >
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <svg
                    className="h-5 w-5 text-gray-600 dark:text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {profile?.full_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile?.email}
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('settings.personalInfo')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.fullName')}
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    defaultValue={profile?.full_name}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={profile?.phone}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('settings.notifications')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email_notifications"
                    name="email_notifications"
                    defaultChecked={profile?.notification_preferences.email}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="email_notifications"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.emailNotifications')}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="push_notifications"
                    name="push_notifications"
                    defaultChecked={profile?.notification_preferences.push}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="push_notifications"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.pushNotifications')}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms_notifications"
                    name="sms_notifications"
                    defaultChecked={profile?.notification_preferences.sms}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="sms_notifications"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.smsNotifications')}
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('settings.privacy')}
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="profile_visibility"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.profileVisibility')}
                  </label>
                  <select
                    id="profile_visibility"
                    name="profile_visibility"
                    defaultValue={profile?.privacy_settings.profile_visibility}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="public">{t('settings.public')}</option>
                    <option value="friends">{t('settings.friends')}</option>
                    <option value="private">{t('settings.private')}</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_email"
                    name="show_email"
                    defaultChecked={profile?.privacy_settings.show_email}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="show_email"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.showEmail')}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_phone"
                    name="show_phone"
                    defaultChecked={profile?.privacy_settings.show_phone}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="show_phone"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {t('settings.showPhone')}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {t('settings.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 