import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { Review, Profile } from '../types/database';

const TestimonialsSection: React.FC = () => {
  const { data: reviews } = useQuery<(Review & { reviewer: Profile })[]>({
    queryKey: ['featuredReviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  const defaultReviews = [
    {
      id: 1,
      reviewer: { full_name: 'Sophie Martin' },
      rating: 5,
      comment: 'D-CARS a rendu mon expérience d\'achat de voiture incroyablement fluide. La plateforme est conviviale, et j\'ai trouvé ma voiture de rêve en quelques jours !',
      created_at: new Date('2024-04-15').toISOString()
    },
    {
      id: 2,
      reviewer: { full_name: 'Jean Dupont' },
      rating: 4,
      comment: 'Excellente sélection de véhicules et prix transparents. Les vendeurs sont professionnels et réactifs. Hautement recommandé !',
      created_at: new Date('2024-03-22').toISOString()
    },
    {
      id: 3,
      reviewer: { full_name: 'Marie Laurent' },
      rating: 5,
      comment: 'En tant que première acquisition automobile, D-CARS m\'a guidé tout au long du processus. Leur équipe de support est exceptionnelle !',
      created_at: new Date('2024-04-01').toISOString()
    },
    {
      id: 4,
      reviewer: { full_name: 'Pierre Rousseau' },
      rating: 4,
      comment: 'J\'ai vendu ma voiture rapidement et à un prix équitable. La plateforme est intuitive et a rendu le processus de vente sans stress.',
      created_at: new Date('2024-02-18').toISOString()
    },
    {
      id: 5,
      reviewer: { full_name: 'Claire Dubois' },
      rating: 5,
      comment: 'Variété incroyable de voitures ! J\'ai trouvé un véhicule d\'occasion certifié qui correspond parfaitement à mon budget.',
      created_at: new Date('2024-04-10').toISOString()
    },
    {
      id: 6,
      reviewer: { full_name: 'Lucas Bernard' },
      rating: 4,
      comment: 'Le processus de vérification me donne confiance dans la qualité des voitures proposées. Une excellente plateforme pour les acheteurs et les vendeurs.',
      created_at: new Date('2024-03-05').toISOString()
    }
  ];

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-2">
          Ce que nos utilisateurs disent
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Découvrez les expériences de nos clients satisfaits avec D-CARS
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(reviews?.length ? reviews : defaultReviews).map((review) => (
            <div 
              key={review.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                  {review.reviewer.full_name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-800">{review.reviewer.full_name}</h3>
                  <p className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/cars"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Parcourir les voitures
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;