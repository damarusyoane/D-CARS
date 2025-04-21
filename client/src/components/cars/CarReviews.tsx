import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { StarIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

interface Review {
  id: string;
  reviewer_id: string;
  vehicle_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface CarReviewsProps {
  vehicleId: string;
}

export default function CarReviews({ vehicleId }: CarReviewsProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    vehicle_id: vehicleId,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ['reviews', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          user:profiles(full_name, avatar_url)
        `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch review statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery<ReviewStats>({
    queryKey: ['reviewStats', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_review_stats', {
        p_vehicle_id: vehicleId,
      });

      if (error) throw error;
      return data;
    },
  });

  // Add review mutation
  const addReview = useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'reviewer_id' | 'created_at' | 'updated_at' | 'user'>) => {
      const { error } = await supabase.from('reviews').insert({
        ...review,
        vehicle_id: vehicleId,
        reviewer_id: user?.id,
        comment: review.comment || null
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vehicleId] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats', vehicleId] });
      setNewReview({ rating: 0, comment: '', vehicle_id: vehicleId });
      toast.success(t('reviews.added'));
    },
    onError: () => {
      toast.error(t('common.error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('reviews.loginRequired'));
      return;
    }
    addReview.mutate({ ...newReview, vehicle_id: vehicleId });
  };

  if (isLoadingReviews || isLoadingStats) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="space-y-8">
      {/* Review Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {t('reviews.overallRating')}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {stats?.average_rating.toFixed(1)}
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <StarIcon
                  key={rating}
                  className={`h-5 w-5 ${
                    rating <= Math.round(stats?.average_rating || 0)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {stats?.total_reviews} {t('reviews.totalReviews')}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="mt-6 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-300 w-8">
                {rating}
              </span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: `${
                      ((stats?.rating_distribution[rating as keyof typeof stats.rating_distribution] || 0) /
                        (stats?.total_reviews || 1)) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 w-12">
                {Math.round(
                  ((stats?.rating_distribution[rating as keyof typeof stats.rating_distribution] || 0) /
                    (stats?.total_reviews || 1)) *
                    100
                )}
                %
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Review Form */}
      {user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('reviews.writeReview')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reviews.rating')}
              </label>
              <div className="flex space-x-1 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating })}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${
                        rating <= newReview.rating
                          ? 'text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('reviews.comment')}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={addReview.isPending}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {addReview.isPending ? t('common.submitting') : t('reviews.submit')}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-start space-x-4">
              <img
                src={review.user.avatar_url || '/default-avatar.png'}
                alt={review.user.full_name}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {review.user.full_name}
                    </h4>
                    <div className="flex items-center mt-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={`h-4 w-4 ${
                            rating <= review.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h5 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                  {review.comment}
                </h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 