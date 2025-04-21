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
          What Our Users Say
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Hear from our satisfied customers about their experience with D-CARS
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews?.map((review) => (
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
                  <p className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString()}</p>
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
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;