import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PriceHistory } from '../types/database';

export function usePriceHistory(vehicleId: string) {
  const queryClient = useQueryClient();

  const { data: priceHistory, isLoading } = useQuery({
    queryKey: ['priceHistory', vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as PriceHistory[];
    }
  });

  const addPricePoint = useMutation({
    mutationFn: async (price: number) => {
      const { data, error } = await supabase
        .from('price_history')
        .insert({ vehicle_id: vehicleId, price })
        .select()
        .single();

      if (error) throw error;
      return data as PriceHistory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceHistory', vehicleId] });
    }
  });

  const getPriceChange = () => {
    if (!priceHistory?.length || priceHistory.length < 2) return 0;
    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const getPriceTrend = () => {
    if (!priceHistory?.length || priceHistory.length < 2) return 'stable';
    const change = getPriceChange();
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  };

  return {
    priceHistory,
    isLoading,
    addPricePoint,
    getPriceChange,
    getPriceTrend
  };
} 