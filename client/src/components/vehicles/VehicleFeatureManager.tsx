import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Feature, VehicleFeature, Vehicle } from '../../types/database';
import { toast } from 'react-hot-toast';
import { SparklesIcon, PlusIcon, TagIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface VehicleFeatureManagerProps {
  vehicleId: string;
  vehicle?: Vehicle;
  isSeller?: boolean;
}

const VehicleFeatureManager: React.FC<VehicleFeatureManagerProps> = ({
  vehicleId,
  vehicle,
  isSeller = true
}) => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [vehicleFeatures, setVehicleFeatures] = useState<VehicleFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFeatureSelector, setShowFeatureSelector] = useState<boolean>(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  useEffect(() => {
    fetchData();
  }, [vehicleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all available features
      const { data: featuresData, error: featuresError } = await supabase
        .from('features')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
        
      if (featuresError) throw featuresError;
      
      // Fetch all features associated with this vehicle
      const { data: vehicleFeaturesData, error: vehicleFeaturesError } = await supabase
        .from('vehicle_features')
        .select('*')
        .eq('vehicle_id', vehicleId);
        
      if (vehicleFeaturesError) throw vehicleFeaturesError;
      
      setFeatures(featuresData || []);
      setVehicleFeatures(vehicleFeaturesData || []);
    } catch (error) {
      console.error('Error fetching feature data:', error);
      toast.error('Failed to load feature information');
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureSelect = (featureSlug: string) => {
    if (selectedFeatures.includes(featureSlug)) {
      setSelectedFeatures(selectedFeatures.filter(slug => slug !== featureSlug));
    } else {
      setSelectedFeatures([...selectedFeatures, featureSlug]);
    }
  };

  const handleAddFeatures = async () => {
    if (selectedFeatures.length === 0) {
      toast.error('Please select at least one feature');
      return;
    }
    
    try {
      // Calculate expiration dates (30 days from now by default)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      // Generate new vehicle feature entries
      const newVehicleFeatures = selectedFeatures.map(featureSlug => ({
        vehicle_id: vehicleId,
        feature_slug: featureSlug,
        expires_at: expirationDate.toISOString()
      }));
      
      // Insert new features
      const { data, error } = await supabase
        .from('vehicle_features')
        .insert(newVehicleFeatures)
        .select();
        
      if (error) throw error;
      
      // Update local state
      setVehicleFeatures([...vehicleFeatures, ...(data || [])]);
      setSelectedFeatures([]);
      setShowFeatureSelector(false);
      
      toast.success('Vehicle features added successfully');
    } catch (error) {
      console.error('Error adding vehicle features:', error);
      toast.error('Failed to add vehicle features');
    }
  };

  const handleRemoveFeature = async (featureId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_features')
        .delete()
        .eq('id', featureId);
        
      if (error) throw error;
      
      // Update local state
      setVehicleFeatures(vehicleFeatures.filter(vf => vf.id !== featureId));
      toast.success('Feature removed successfully');
    } catch (error) {
      console.error('Error removing feature:', error);
      toast.error('Failed to remove feature');
    }
  };

  const isFeatureExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const getFeatureDetails = (featureSlug: string) => {
    return features.find(f => f.slug === featureSlug);
  };

  const renderFeatureCard = (vehicleFeature: VehicleFeature) => {
    const feature = getFeatureDetails(vehicleFeature.feature_slug);
    const expired = isFeatureExpired(vehicleFeature.expires_at);
    
    if (!feature) return null;
    
    return (
      <div 
        key={vehicleFeature.id}
        className={`border rounded-lg overflow-hidden bg-white ${expired ? 'opacity-60' : ''}`}
      >
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-2 rounded-md ${expired ? 'bg-gray-100' : 'bg-blue-100'}`}>
                <SparklesIcon className={`h-5 w-5 ${expired ? 'text-gray-500' : 'text-blue-600'}`} />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{feature.description}</p>
              </div>
            </div>
            
            {expired ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center text-xs text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              {expired ? 'Expired on ' : 'Expires on '}
              {new Date(vehicleFeature.expires_at).toLocaleDateString()}
            </div>
            
            <div className="flex items-center text-xs">
              <TagIcon className="h-4 w-4 mr-1 text-gray-500" />
              <span className="font-medium">${feature.price}</span>
            </div>
          </div>
          
          {isSeller && !expired && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => handleRemoveFeature(vehicleFeature.id)}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-gray-50"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFeatureSelector = () => {
    return (
      <div className="mt-4 border rounded-lg bg-white p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Features</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {features.map(feature => {
            const isSelected = selectedFeatures.includes(feature.slug);
            
            return (
              <div 
                key={feature.id}
                className={`border rounded p-3 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => handleFeatureSelect(feature.slug)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{feature.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                  <div className="font-medium text-sm">${feature.price}</div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Duration: {feature.duration_days} days
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setShowFeatureSelector(false)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddFeatures}
            className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={selectedFeatures.length === 0}
          >
            Add Selected Features
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter out only non-expired features for display
  const activeVehicleFeatures = vehicleFeatures.filter(vf => !isFeatureExpired(vf.expires_at));
  const expiredVehicleFeatures = vehicleFeatures.filter(vf => isFeatureExpired(vf.expires_at));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Enhanced Listing Features
        </h2>
        
        {isSeller && (
          <button
            type="button"
            onClick={() => setShowFeatureSelector(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={showFeatureSelector}
          >
            <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
            Add Features
          </button>
        )}
      </div>

      {showFeatureSelector && renderFeatureSelector()}
      
      {!showFeatureSelector && (
        <>
          {activeVehicleFeatures.length === 0 && expiredVehicleFeatures.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <SparklesIcon className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enhanced features</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isSeller
                  ? "Add features to make your listing stand out!"
                  : "This listing has no enhanced features."}
              </p>
              {isSeller && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowFeatureSelector(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="-ml-0.5 mr-1 h-4 w-4" />
                    Add Features
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {activeVehicleFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Active Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeVehicleFeatures.map(renderFeatureCard)}
                  </div>
                </div>
              )}
              
              {expiredVehicleFeatures.length > 0 && isSeller && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Expired Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {expiredVehicleFeatures.map(renderFeatureCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VehicleFeatureManager;
