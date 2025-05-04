import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { VehicleOffer, Vehicle, Profile } from '../../types/database';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface VehicleOffersListProps {
  vehicleId?: string; // Optional: to filter offers for a specific vehicle
  isSeller?: boolean; // If true, shows seller view, otherwise buyer view
}

interface OfferWithDetails extends VehicleOffer {
  vehicle?: Vehicle;
  buyer?: Profile;
  seller?: Profile;
}

const VehicleOffersList: React.FC<VehicleOffersListProps> = ({ 
  vehicleId, 
  isSeller = true 
}) => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Build query to get offers for this user (as seller or buyer)
        let query = supabase
          .from('vehicle_offers')
          .select(`
            *,
            vehicle:vehicle_id(id, make, model, year, price, images),
            buyer:buyer_id(id, full_name, avatar_url),
            seller:seller_id(id, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false });
          
        // Filter by role (seller or buyer)
        if (isSeller) {
          query = query.eq('seller_id', user.id);
        } else {
          query = query.eq('buyer_id', user.id);
        }
        
        // Filter by specific vehicle if provided
        if (vehicleId) {
          query = query.eq('vehicle_id', vehicleId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setOffers(data || []);
      } catch (error) {
        console.error('Error fetching offers:', error);
        toast.error('Failed to load offers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOffers();
  }, [user, vehicleId, isSeller]);

  const handleOfferAction = async (offerId: string, action: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('vehicle_offers')
        .update({ status: action })
        .eq('id', offerId);
        
      if (error) throw error;
      
      // Update local state
      setOffers(offers.map(offer => 
        offer.id === offerId ? { ...offer, status: action } : offer
      ));
      
      // Find the offer to get details for notification
      const updatedOffer = offers.find(o => o.id === offerId);
      
      if (updatedOffer) {
        // Create notification for buyer
        await supabase
          .from('notifications')
          .insert({
            profile_id: updatedOffer.buyer_id,
            type: 'offer_response',
            title: `Offre ${action === 'accepted' ? 'Acceptée' : 'Refusée'}`,
            message: action === 'accepted'
              ? `Votre offre de ${Math.round(updatedOffer.amount * 600).toLocaleString()} XAF pour le ${updatedOffer.vehicle?.year} ${updatedOffer.vehicle?.make} ${updatedOffer.vehicle?.model} a été acceptée !`
              : `Votre offre de ${Math.round(updatedOffer.amount * 600).toLocaleString()} XAF pour le ${updatedOffer.vehicle?.year} ${updatedOffer.vehicle?.make} ${updatedOffer.vehicle?.model} a été refusée.`,
            is_read: false,
            data: {
              vehicle_id: updatedOffer.vehicle_id,
              offer_id: updatedOffer.id
            }
          });
        
        // If accepted, update vehicle status to pending
        if (action === 'accepted') {
          await supabase
            .from('vehicles')
            .update({ status: 'pending' })
            .eq('id', updatedOffer.vehicle_id);
        }
      }
      
      toast.success(`Offer ${action === 'accepted' ? 'accepted' : 'declined'} successfully`);
    } catch (error) {
      console.error(`Error ${action} offer:`, error);
      toast.error(`Failed to ${action === 'accepted' ? 'accept' : 'decline'} offer`);
    }
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="mr-1 h-3 w-3" />
            En Attente
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Accepté
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="mr-1 h-3 w-3" />
            Refusé
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Expiré
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Terminé
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          {isSeller
            ? "Vous n'avez pas encore reçu d'offres sur vos véhicules."
            : "Vous n'avez pas encore fait d'offres sur des véhicules."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {offers.map((offer) => {
          const isExpanded = expandedOfferId === offer.id;
          const isPending = offer.status === 'pending';
          const formattedDate = new Date(offer.created_at).toLocaleDateString();
          const formattedExpirationDate = offer.expires_at 
            ? new Date(offer.expires_at).toLocaleDateString() 
            : null;
            
          const percentOfAsking = ((offer.amount / (offer.vehicle?.price || 1)) * 100).toFixed(1);
          
          return (
            <li key={offer.id} className="hover:bg-gray-50">
              <div 
                className="block px-4 py-4 sm:px-6 cursor-pointer"
                onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <div className="flex text-sm">
                      <p className="font-medium text-gray-900 truncate">
                        {offer.vehicle?.year} {offer.vehicle?.make} {offer.vehicle?.model}
                      </p>
                      <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                        • Created on {formattedDate}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center">
                      <p className="text-lg font-semibold text-gray-900">
                        ${offer.amount.toLocaleString()}
                      </p>
                      <p className={`ml-2 text-xs ${
                        parseFloat(percentOfAsking) < 100 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        ({percentOfAsking}% of asking price)
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      {isSeller ? (
                        <div className="flex items-center">
                          <span className="flex-shrink-0 mr-1.5">
                            <img 
                              src={offer.buyer?.avatar_url || '/assets/default-avatar.png'} 
                              alt="" 
                              className="h-5 w-5 rounded-full"
                            />
                          </span>
                          <p>Offer from {offer.buyer?.full_name}</p>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="flex-shrink-0 mr-1.5">
                            <img 
                              src={offer.seller?.avatar_url || '/assets/default-avatar.png'} 
                              alt="" 
                              className="h-5 w-5 rounded-full"
                            />
                          </span>
                          <p>Offer to {offer.seller?.full_name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0">
                    {getOfferStatusBadge(offer.status)}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4">
                    <div className="border-t border-gray-200 pt-4">
                      {offer.message && (
                        <div className="mb-4">
                          <div className="flex items-center">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                            <h3 className="text-sm font-medium text-gray-900">Message</h3>
                          </div>
                          <div className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                            {offer.message}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Offer Details</h3>
                          <ul className="mt-2 text-sm space-y-2">
                            <li className="text-gray-500">
                              Status: <span className="text-gray-900">{offer.status}</span>
                            </li>
                            <li className="text-gray-500">
                              Created: <span className="text-gray-900">{formattedDate}</span>
                            </li>
                            {formattedExpirationDate && (
                              <li className="text-gray-500">
                                Expires: <span className="text-gray-900">{formattedExpirationDate}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Vehicle Details</h3>
                          <ul className="mt-2 text-sm space-y-2">
                            <li className="text-gray-500">
                              Model: <span className="text-gray-900">{offer.vehicle?.year} {offer.vehicle?.make} {offer.vehicle?.model}</span>
                            </li>
                            <li className="text-gray-500">
                              Asking Price: <span className="text-gray-900">${offer.vehicle?.price.toLocaleString()}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      {isSeller && isPending && (
                        <div className="mt-4 flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => handleOfferAction(offer.id, 'declined')}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <XCircleIcon className="-ml-0.5 mr-1 h-4 w-4 text-red-500" aria-hidden="true" />
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOfferAction(offer.id, 'accepted')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <CheckCircleIcon className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default VehicleOffersList;
