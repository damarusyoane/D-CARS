import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Favorite, Vehicle } from '../types/database';

export function useFavorites() {
  const queryClient = useQueryClient();

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          vehicle:vehicles(*)
        `);

      if (error) throw error;
      return data as (Favorite & { vehicle: Vehicle })[];
    }
  });

  const addFavorite = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { data, error } = await supabase
        .from('favorites')
        .insert({ vehicle_id: vehicleId })
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .single();

      if (error) throw error;
      return data as Favorite & { vehicle: Vehicle };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const removeFavorite = useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('vehicle_id', vehicleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

  const isFavorite = (vehicleId: string) => {
    return favorites?.some(favorite => favorite.vehicle_id === vehicleId) ?? false;
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite
  };
} 