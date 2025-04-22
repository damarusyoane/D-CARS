import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { VehicleReport, Vehicle } from '../../types/database';
import { toast } from 'react-hot-toast';
import { DocumentCheckIcon, DocumentIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface VehicleReportViewProps {
  vehicleId: string;
  vehicle?: Vehicle;
  canAddReport?: boolean;
}

const VehicleReportView: React.FC<VehicleReportViewProps> = ({ 
  vehicleId, 
  vehicle, 
  canAddReport = false 
}) => {
  const { profile } = useAuth();
  const [report, setReport] = useState<VehicleReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddingReport, setIsAddingReport] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    vin: '',
    reportProvider: '',
    reportUrl: '',
    verified: false
  });

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    fetchVehicleReport();
  }, [vehicleId]);

  const fetchVehicleReport = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vehicle_reports')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .maybeSingle();
        
      if (error) throw error;
      
      setReport(data);
    } catch (error) {
      console.error('Error fetching vehicle report:', error);
      toast.error('Failed to load vehicle report information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReport = () => {
    setIsAddingReport(true);
    // If we have a vehicle with a VIN at the top level, pre-fill it (if such a property exists)
    if (vehicle && (vehicle as any).vin) {
      setFormData(prev => ({
        ...prev,
        vin: (vehicle as any).vin
      }));
    }
  };
  // Note: If VIN is not present at the top level, this will simply not pre-fill. Remove this block if VIN is never present.

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: val
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vin.trim()) {
      toast.error('VIN is required');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('vehicle_reports')
        .insert({
          vehicle_id: vehicleId,
          vin: formData.vin.trim(),
          report_provider: formData.reportProvider.trim() || null,
          report_url: formData.reportUrl.trim() || null,
          verified: isAdmin ? formData.verified : false,
          report_data: null
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setReport(data);
      setIsAddingReport(false);
      toast.success('Vehicle report added successfully');
      
      // Create notification for vehicle owner
      if (vehicle && vehicle.profile_id) {
        await supabase
          .from('notifications')
          .insert({
            profile_id: vehicle.profile_id,
            type: 'report',
            title: 'Vehicle Report Added',
            message: `A vehicle report has been added for your ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            is_read: false,
            data: {
              vehicle_id: vehicleId,
              report_id: data.id
            }
          });
      }
    } catch (error) {
      console.error('Error adding vehicle report:', error);
      toast.error('Failed to add vehicle report');
    }
  };

  const verifyReport = async () => {
    if (!report || !isAdmin) return;
    
    try {
      const { error } = await supabase
        .from('vehicle_reports')
        .update({ verified: true })
        .eq('id', report.id);
        
      if (error) throw error;
      
      setReport({
        ...report,
        verified: true
      });
      
      toast.success('Report verified successfully');
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report && !isAddingReport) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-2">
              <DocumentIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium leading-6 text-gray-900">No vehicle report available</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Vehicle history reports provide important information about the vehicle's past.</p>
              </div>
              {canAddReport && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddReport}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentCheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Vehicle Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAddingReport) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Add Vehicle Report</h3>
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700">
                  VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="vin"
                  id="vin"
                  placeholder="Enter 17-character VIN"
                  value={formData.vin}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">The VIN is a 17-character identifier unique to each vehicle</p>
              </div>
              
              <div>
                <label htmlFor="reportProvider" className="block text-sm font-medium text-gray-700">
                  Report Provider
                </label>
                <select
                  id="reportProvider"
                  name="reportProvider"
                  value={formData.reportProvider}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select provider (optional)</option>
                  <option value="Carfax">Carfax</option>
                  <option value="AutoCheck">AutoCheck</option>
                  <option value="VinAudit">VinAudit</option>
                  <option value="National Motor Vehicle Title Information System">NMVTIS</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="reportUrl" className="block text-sm font-medium text-gray-700">
                  Report URL
                </label>
                <input
                  type="url"
                  name="reportUrl"
                  id="reportUrl"
                  placeholder="https://example.com/report"
                  value={formData.reportUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Link to the vehicle history report (if available)</p>
              </div>
              
              {isAdmin && (
                <div className="flex items-center">
                  <input
                    id="verified"
                    name="verified"
                    type="checkbox"
                    checked={formData.verified}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="verified" className="ml-2 block text-sm text-gray-900">
                    Mark as verified
                  </label>
                </div>
              )}
              
              <div className="pt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddingReport(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Report
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Display existing report
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <DocumentCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">Vehicle Report</h3>
          </div>
          {report?.verified ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Unverified
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">VIN</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{report?.vin}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Report Provider</dt>
            <dd className="mt-1 text-sm text-gray-900">{report?.report_provider || 'Not specified'}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Report URL</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {report?.report_url ? (
                <a 
                  href={report.report_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  View Full Report
                </a>
              ) : (
                'No report URL provided'
              )}
            </dd>
          </div>
          
          {report?.report_data && Object.keys(report.report_data).length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Report Data</dt>
              <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">
                <pre className="whitespace-pre-wrap">{JSON.stringify(report.report_data, null, 2)}</pre>
              </dd>
            </div>
          )}
          
          {isAdmin && !report?.verified && (
            <div className="sm:col-span-2 border-t pt-4">
              <button
                type="button"
                onClick={verifyReport}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ShieldCheckIcon className="-ml-0.5 mr-2 h-4 w-4" />
                Verify Report
              </button>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default VehicleReportView;
