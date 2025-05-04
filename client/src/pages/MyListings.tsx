import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';


interface Listing {
  id: string;
  title: string;
  price: number;
  description: string;
  make: string;
  model: string;
  year: number;
  status: 'active' | 'pending' | 'sold' | 'rejected';
  images: string[];
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
}

const MyListings: React.FC = () => {
  const { user, profile, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Veuillez vous connecter pour voir vos annonces.</p>
      </div>
    );
  }
  // Role-based access control
  if (profile && profile.role !== 'seller' && profile.role !== 'admin') {
    toast.error('Vous n\'avez pas la permission d\'accéder à cette page.');
    navigate('/');
    return null;
  }
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'sold' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate('/auth/login');
        return;
      }

      // Build query
      let query = supabase
        .from('vehicles')
        .select('*')
        .eq('profile_id', currentUser.id)
        .order('created_at', { ascending: false });

      // Add filter if selected
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      // Execute query
      const { data, error } = await query;

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setError('Failed to load your listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch listings on mount and when filter changes
  useEffect(() => {
    const abortController = new AbortController();
    fetchListings();
    return () => {
      abortController.abort();
    };
  }, [filter]);

  const handleDeleteListing = async (id: string) => {
    try {
      setIsDeleting(true);
      setListingToDelete(id);

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setListings(listings.filter(listing => listing.id !== id));
      toast.success('Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      toast.error('Failed to delete listing. Please try again.');
    } finally {
      setIsDeleting(false);
      setListingToDelete(null);
    }
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      handleDeleteListing(id);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'sold':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const filteredListings = listings.filter(listing => {
    if (searchQuery) {
      return listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             listing.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
             listing.model.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
        <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Erreur de chargement des annonces</h2>
        <p className="text-gray-400 mb-4 text-center">{error}</p>
        <button 
          onClick={() => fetchListings()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mes Annonces de Véhicules</h1>
          <p className="text-gray-400">Gérez toutes vos annonces de véhicules en un seul endroit</p>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          {/* Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Toutes les annonces
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              En attente
            </button>
            <button
              onClick={() => setFilter('sold')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'sold' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Vendus
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Refusés
            </button>
          </div>
          
          <div className="flex items-center space-x-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-grow md:max-w-xs">
              <input 
                type="text" 
                placeholder="Rechercher des annonces..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Create New */}
            <Link
              to="/dashboard/create-listing"
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              <span>Ajouter une annonce</span>
            </Link>
          </div>
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-10 text-center">
            <div className="flex justify-center mb-4">
              <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
            <p className="text-gray-400 mb-6">
              {filter !== 'all' 
                ? `Vous n'avez aucune annonce ${filter === 'active' ? 'active' : filter === 'pending' ? 'en attente' : filter === 'sold' ? 'vendue' : filter === 'rejected' ? 'refusée' : ''} pour le moment.` 
                : searchQuery 
                  ? `Aucun résultat trouvé pour "${searchQuery}".`
                  : "Vous n'avez pas encore créé d'annonces de véhicules."}
            </p>
            <Link
              to="/dashboard/create-listing"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Créer votre première annonce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-lg hover:translate-y-[-2px]"
              >
                <Link to={`/cars/${listing.id}`} className="block relative">
                  <div className="relative w-full h-48 bg-gray-900 overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <span>Aucune image disponible</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(listing.status)}`}>
                        {listing.status === 'active' && 'Actif'}
                        {listing.status === 'pending' && 'En attente'}
                        {listing.status === 'sold' && 'Vendu'}
                        {listing.status === 'rejected' && 'Refusé'}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link to={`/cars/${listing.id}`} className="block">
                        <h3 className="text-lg font-semibold hover:text-blue-400 transition-colors line-clamp-2">
                          {listing.title}
                        </h3>
                      </Link>
                      <div className="text-sm text-gray-400 mt-1">
                        {listing.year} {listing.make} {listing.model}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-green-400">
                      ${listing.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 line-clamp-2 mb-4">
                    {listing.description}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>{listing.views || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <HeartIcon className="h-4 w-4 mr-1" />
                        <span>{listing.likes || 0}</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      Publié le: {new Date(listing.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Link
                      to={`/dashboard/edit-listing/${listing.id}`}
                      className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm rounded transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Modifier
                    </Link>
                    <button 
                      onClick={() => confirmDelete(listing.id)}
                      disabled={isDeleting && listingToDelete === listing.id}
                      className="flex items-center px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm rounded transition-colors disabled:opacity-50"
                    >
                      {isDeleting && listingToDelete === listing.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <TrashIcon className="w-4 h-4 mr-1" />
                          Supprimer
                        </>
                      )}
                    </button>
                  </div>

                  {listing.status === 'rejected' && (
                    <div className="mt-3 p-2 bg-red-500/10 rounded text-xs text-red-400 italic">
                      Votre annonce a été refusée par l'administrateur. Veuillez la modifier et la soumettre à nouveau.
                    </div>
                  )}

                  {listing.status === 'pending' && (
                    <div className="mt-3 p-2 bg-yellow-500/10 rounded text-xs text-yellow-400 italic">
                      En attente d'approbation par l'administrateur avant d'être visible par les acheteurs.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListings;