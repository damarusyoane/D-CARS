import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Review, Profile } from '../types/database';

export function useReviews(vehicleId: string) {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles(*)
        `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Review & { reviewer: Profile })[];
    }
  });

  const addReview = useMutation({
    mutationFn: async (newReview: Omit<Review, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(newReview)
        .select(`
          *,
          reviewer:profiles(*)
        `)
        .single();

      if (error) throw error;
      return data as Review & { reviewer: Profile };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vehicleId] });
    }
  });

  const updateReview = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          reviewer:profiles(*)
        `)
        .single();

      if (error) throw error;
      return data as Review & { reviewer: Profile };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vehicleId] });
    }
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', vehicleId] });
    }
  });

  const getAverageRating = () => {
    if (!reviews?.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  return {
    reviews,
    isLoading,
    addReview,
    updateReview,
    deleteReview,
    getAverageRating
  };
} 