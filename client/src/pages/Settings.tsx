import React, { useState } from 'react';
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface SettingsSection {
  id: string;
  name: string;
  icon: React.ForwardRefExoticComponent<any>;
}

interface FormData {
  account: {
    name: string;
    email: string;
    phone: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
    messages: boolean;
    updates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowMessages: boolean;
  };
  language: {
    preferred: string;
    region: string;
  };
}

const sections: SettingsSection[] = [
  { id: 'account', name: 'Account Settings', icon: UserIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
  { id: 'privacy', name: 'Privacy & Security', icon: ShieldCheckIcon },
  { id: 'language', name: 'Language & Region', icon: GlobeAltIcon },
];

type BooleanKeys<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never
}[keyof T];

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('account');
  const [formData, setFormData] = useState<FormData>({
    account: {
      name: '',
      email: '',
      phone: '',
    },
    notifications: {
      email: false,
      push: false,
      messages: false,
      updates: false,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true,
    },
    language: {
      preferred: 'en',
      region: 'US',
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof FormData],
        [field]: value
      }
    }));
  };

  const handleCheckboxChange = <T extends keyof FormData>(
    section: T,
    field: BooleanKeys<FormData[T]>
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: !prev[section][field]
      }
    }));
  };

  const handleProfileVisibilityChange = (value: 'public' | 'private' | 'friends') => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        profileVisibility: value
      }
    }));
  };

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">Full Name</label>
        <input
          type="text"
          name="account.name"
          value={formData.account.name}
          onChange={handleInputChange}
          className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Email</label>
        <input
          type="email"
          name="account.email"
          value={formData.account.email}
          onChange={handleInputChange}
          className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Phone</label>
        <input
          type="tel"
          name="account.phone"
          value={formData.account.phone}
          onChange={handleInputChange}
          className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      {Object.entries(formData.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center">
          <input
            type="checkbox"
            checked={value}
            onChange={() => handleCheckboxChange('notifications', key as keyof FormData['notifications'])}
            className="h-4 w-4 rounded border-gray-300 text-dark-accent focus:ring-dark-accent"
          />
          <label className="ml-2 text-sm text-gray-300 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
        </div>
      ))}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile Visibility</h3>
        <div className="mt-4 space-y-4">
          {['public', 'private', 'friends'].map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="radio"
                id={`visibility-${option}`}
                name="profileVisibility"
                value={option}
                checked={formData.privacy.profileVisibility === option}
                onChange={(e) => handleProfileVisibilityChange(e.target.value as 'public' | 'private' | 'friends')}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`visibility-${option}`} className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              checked={formData.privacy.showEmail}
              onChange={() => handleCheckboxChange('privacy', 'showEmail')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">Show Email</label>
            <p className="text-gray-500">Allow others to see your email address</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              checked={formData.privacy.showPhone}
              onChange={() => handleCheckboxChange('privacy', 'showPhone')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">Show Phone Number</label>
            <p className="text-gray-500">Allow others to see your phone number</p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              type="checkbox"
              checked={formData.privacy.allowMessages}
              onChange={() => handleCheckboxChange('privacy', 'allowMessages')}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">Allow Messages</label>
            <p className="text-gray-500">Allow others to send you messages</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300">Preferred Language</label>
        <select
          name="language.preferred"
          value={formData.language.preferred}
          onChange={handleInputChange}
          className="w-full bg-dark-primary border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-dark-accent"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return renderAccountSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'language':
        return renderLanguageSettings();
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-dark-secondary rounded-lg p-4">
          <nav className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-dark-accent/10 text-dark-accent'
                    : 'text-gray-400 hover:bg-dark-accent/5 hover:text-gray-300'
                }`}
              >
                <section.icon className="h-5 w-5 mr-3" />
                {section.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-dark-secondary rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">
            {sections.find((s) => s.id === activeSection)?.name}
          </h2>
          {renderContent()}
          <div className="mt-8 flex justify-end space-x-4">
            <button className="px-4 py-2 text-sm text-gray-400 hover:text-gray-300">
              Cancel
            </button>
            <button className="px-4 py-2 bg-dark-accent text-white text-sm rounded-lg hover:bg-dark-accent/90">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 