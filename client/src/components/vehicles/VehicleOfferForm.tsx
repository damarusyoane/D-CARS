import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Vehicle } from '../../types/database';
import { toast } from 'react-hot-toast';

interface VehicleOfferFormProps {
  vehicle: Vehicle;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const VehicleOfferForm: React.FC<VehicleOfferFormProps> = ({ 
  vehicle, 
  onSuccess, 
  onCancel 
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>(vehicle.price.toString());
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Set default expiration date to 3 days from now
  const defaultExpirationDate = new Date();
  defaultExpirationDate.setDate(defaultExpirationDate.getDate() + 3);
  
  const [expirationDate, setExpirationDate] = useState<string>(
    defaultExpirationDate.toISOString().split('T')[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to make an offer');
      return;
    }
    
    if (user.id === vehicle.profile_id) {
      toast.error('You cannot make an offer on your own vehicle');
      return;
    }
    
    const offerAmount = parseFloat(amount);
    
    if (isNaN(offerAmount) || offerAmount <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Check if user already has a pending offer for this vehicle
      const { data: existingOffers, error: checkError } = await supabase
        .from('vehicle_offers')
        .select('id')
        .eq('vehicle_id', vehicle.id)
        .eq('buyer_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingOffers) {
        toast.error('You already have a pending offer for this vehicle');
        return;
      }
      
      // Submit new offer
      const { error } = await supabase
        .from('vehicle_offers')
        .insert({
          vehicle_id: vehicle.id,
          buyer_id: user.id,
          seller_id: vehicle.profile_id,
          amount: offerAmount,
          message: message || null,
          expires_at: new Date(expirationDate).toISOString(),
          status: 'pending'
        });
        
      if (error) throw error;
      
      // Create notification for seller
      await supabase
        .from('notifications')
        .insert({
          profile_id: vehicle.profile_id,
          type: 'offer',
          title: 'New offer received',
          message: `You have received a new offer of ${offerAmount.toLocaleString()} for your ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          is_read: false,
          data: {
            vehicle_id: vehicle.id,
            amount: offerAmount
          }
        });
      
      toast.success('Your offer has been sent to the seller');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Make an Offer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Your Offer Amount
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          {parseFloat(amount) < vehicle.price && (
            <p className="mt-1 text-sm text-blue-600">
              Your offer is {(100 - (parseFloat(amount) / vehicle.price) * 100).toFixed(1)}% below asking price
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="expiration" className="block text-sm font-medium text-gray-700 mb-1">
            Offer Valid Until
          </label>
          <input
            type="date"
            name="expiration"
            id="expiration"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message to Seller (Optional)
          </label>
          <textarea
            name="message"
            id="message"
            rows={3}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Add a personal message to the seller..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        <div className="pt-3 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Send Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleOfferForm;
