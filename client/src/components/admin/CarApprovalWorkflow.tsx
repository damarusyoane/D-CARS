import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  location: string;
  status: string;
  seller_id: string;
  images: string[];
  created_at: string;
  seller?: {
    full_name: string;
    email: string;
  };
  description?: string;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  body_type?: string;
  color?: string;
}

interface CarApprovalWorkflowProps {
  pendingVehicles: Vehicle[];
  onApprove: (vehicleId: string) => Promise<void>;
  onReject: (vehicleId: string, reason: string) => Promise<void>;
  processingId: string | null;
}

const CarApprovalWorkflow: React.FC<CarApprovalWorkflowProps> = ({
  pendingVehicles,
  onApprove,
  onReject,
  processingId
}) => {
  const { user } = useAuth();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Messaging handler
  const handleOpenMessageModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsMessageModalOpen(true);
    setMessageText('');
  };
  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageText('');
  };
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedVehicle) return;
    setSendingMessage(true);
    try {
      // Admin is sender, seller is recipient
      const { error } = await supabase.from('messages').insert({
        sender_id: user?.id,
        receiver_id: selectedVehicle.seller_id,
        vehicle_id: selectedVehicle.id,
        content: messageText.trim(),
        status: 'unread',
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      toast.success('Message sent to seller!');
      setIsMessageModalOpen(false);
      setMessageText('');
    } catch (err) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentImageIndex(0);
  };

  const handleCloseDetails = () => {
    setSelectedVehicle(null);
  };

  const handleOpenRejectModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsRejectModalOpen(true);
    setRejectReason('');
  };

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false);
  };

  const handleSubmitRejection = async () => {
    if (selectedVehicle) {
      await onReject(selectedVehicle.id, rejectReason);
      setIsRejectModalOpen(false);
      setSelectedVehicle(null);
    }
  };

  const nextImage = () => {
    if (selectedVehicle && selectedVehicle.images) {
      setCurrentImageIndex((currentImageIndex + 1) % selectedVehicle.images.length);
    }
  };

  const prevImage = () => {
    if (selectedVehicle && selectedVehicle.images) {
      setCurrentImageIndex((currentImageIndex - 1 + selectedVehicle.images.length) % selectedVehicle.images.length);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Vehicule en attente d'approbation</h2>
        <p className="text-gray-400 mt-1">Veuillez approuver les vehicules avant qu'ils ne soient afficher sur le site</p>
      </div>

      {pendingVehicles.length === 0 ? (
        <div className="text-center py-12 px-6">
          <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-green-500/20">
            <CheckCircleIcon className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Tout est en ordre!</h3>
          <p className="text-gray-400 max-w-md mx-auto">Aucune voiture en attente d'approbation. Les vehicules en attente seront afficher ici</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vehicule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Vendeur</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prix</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date de soumission</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pendingVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-16 flex-shrink-0 mr-4 bg-gray-700 rounded overflow-hidden">
                        {vehicle.images && vehicle.images.length > 0 ? (
                          <img src={vehicle.images[0]} alt={vehicle.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">Aucune image</div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{vehicle.title}</div>
                        <div className="text-sm text-gray-400">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{vehicle.seller?.full_name}</div>
                    <div className="text-sm text-gray-400">{vehicle.seller?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-400">XAF{vehicle.price.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(vehicle.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Voir details"
                        aria-label="Voir details"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenMessageModal(vehicle)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Ecrire au vendeur"
                        aria-label="Ecrire au vendeur"
                      >
                        <ChatBubbleLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onApprove(vehicle.id)}
                        disabled={processingId === vehicle.id}
                        className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approuver"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(vehicle)}
                        disabled={processingId === vehicle.id}
                        className="text-red-400 hover:text-red-300 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refuser"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {selectedVehicle && !isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{selectedVehicle.title}</h3>
              <button onClick={handleCloseDetails} className="text-gray-400 hover:text-white" title="Fermer les details" aria-label="Close details">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Image Gallery */}
              <div className="relative h-64 md:h-96 bg-gray-700 rounded-lg mb-6 overflow-hidden">
                {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                  <>
                    <img 
                      src={selectedVehicle.images[currentImageIndex]} 
                      alt={`${selectedVehicle.make} ${selectedVehicle.model}`} 
                      className="w-full h-full object-contain"
                    />
                    {selectedVehicle.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full px-3 py-1 text-white text-sm">
                            {currentImageIndex + 1} / {selectedVehicle.images.length}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Aucune image disponible
                  </div>
                )}
              </div>
              
              {/* Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Vehicle Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Marque</dt>
                      <dd className="text-white font-medium">{selectedVehicle.make}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Model</dt>
                      <dd className="text-white font-medium">{selectedVehicle.model}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Annee</dt>
                      <dd className="text-white font-medium">{selectedVehicle.year}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Prix</dt>
                      <dd className="text-green-400 font-medium">XAF{selectedVehicle.price.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Localisation</dt>
                      <dd className="text-white font-medium">{selectedVehicle.location}</dd>
                    </div>
                    {selectedVehicle.mileage && (
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Kilometrage</dt>
                        <dd className="text-white font-medium">{selectedVehicle.mileage.toLocaleString()} km</dd>
                      </div>
                    )}
                    {selectedVehicle.fuel_type && (
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Type de Carburant</dt>
                        <dd className="text-white font-medium">{selectedVehicle.fuel_type}</dd>
                      </div>
                    )}
                    {selectedVehicle.transmission && (
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Transmission</dt>
                        <dd className="text-white font-medium">{selectedVehicle.transmission}</dd>
                      </div>
                    )}
                    {selectedVehicle.body_type && (
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Type de Carousserie</dt>
                        <dd className="text-white font-medium">{selectedVehicle.body_type}</dd>
                      </div>
                    )}
                    {selectedVehicle.color && (
                      <div className="flex justify-between">
                        <dt className="text-gray-400">Couleur</dt>
                        <dd className="text-white font-medium">{selectedVehicle.color}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">Information du vendeur</h4>
                  <dl className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Nom</dt>
                      <dd className="text-white font-medium">{selectedVehicle.seller?.full_name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Email</dt>
                      <dd className="text-white font-medium">{selectedVehicle.seller?.email}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Date de l'annonce</dt>
                      <dd className="text-white font-medium">{new Date(selectedVehicle.created_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                  
                  <h4 className="text-lg font-medium text-white mb-4">Description</h4>
                  <div className="bg-gray-700 rounded-lg p-4 text-gray-300">
                    {selectedVehicle.description || "No description provided."}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleOpenRejectModal(selectedVehicle)}
                  disabled={processingId === selectedVehicle.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {processingId === selectedVehicle.id ? <LoadingSpinner size="sm" /> : <XCircleIcon className="w-5 h-5" />}
                  <span>Refuser</span>
                </button>
                <button
                  onClick={() => onApprove(selectedVehicle.id)}
                  disabled={processingId === selectedVehicle.id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {processingId === selectedVehicle.id ? <LoadingSpinner size="sm" /> : <CheckCircleIcon className="w-5 h-5" />}
                  <span>Accepter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {isRejectModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Refuser les annonces</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-300 mb-2">
                Vous allez refuser la vente suivante:
                </p>
                <p className="font-medium text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-400 mb-2">
                  Motif de refus (sera envoyé au vendeur)
                </label>
                <textarea
                  id="rejectReason"
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide a reason for rejecting this listing..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCloseRejectModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitRejection}
                  disabled={!rejectReason.trim() || processingId === selectedVehicle.id}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {processingId === selectedVehicle.id ? <LoadingSpinner size="sm" /> : <XCircleIcon className="w-5 h-5" />}
                  <span>Confirmation du refus</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    {/* Message Seller Modal */}
    {isMessageModalOpen && selectedVehicle && (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Message Seller</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <p className="text-gray-300 mb-2">
               Envoyer un message au vendeur:
              </p>
              <p className="font-medium text-white">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
            </div>
            <div className="mb-6">
              <label htmlFor="adminMessage" className="block text-sm font-medium text-gray-400 mb-2">
                Message
              </label>
              <textarea
                id="adminMessage"
                rows={4}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 text-white focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your message to the seller..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseMessageModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sendingMessage}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
              >
                {sendingMessage ? <LoadingSpinner size="sm" /> : <ChatBubbleLeftIcon className="w-5 h-5" />}
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default CarApprovalWorkflow;
