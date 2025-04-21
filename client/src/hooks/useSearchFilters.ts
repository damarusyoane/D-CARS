import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { SearchFilter } from '../types/database';

export function useSearchFilters() {
  const queryClient = useQueryClient();

  const { data: filters, isLoading } = useQuery({
    queryKey: ['searchFilters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_filters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SearchFilter[];
    }
  });

  const addFilter = useMutation({
    mutationFn: async (newFilter: Omit<SearchFilter, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('search_filters')
        .insert(newFilter)
        .select()
        .single();

      if (error) throw error;
      return data as SearchFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchFilters'] });
    }
  });

  const updateFilter = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SearchFilter> & { id: string }) => {
      const { data, error } = await supabase
        .from('search_filters')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as SearchFilter;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchFilters'] });
    }
  });

  const deleteFilter = useMutation({
    mutationFn: async (filterId: string) => {
      const { error } = await supabase
        .from('search_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchFilters'] });
    }
  });

  const applyFilter = async (filter: SearchFilter['filters']) => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .gte('price', filter.minPrice ?? 0)
      .lte('price', filter.maxPrice ?? Number.MAX_SAFE_INTEGER)
      .gte('year', filter.minYear ?? 1900)
      .lte('year', filter.maxYear ?? new Date().getFullYear() + 1)
      .in('condition', filter.condition ?? ['new', 'used', 'certified'])
      .in('make', filter.make ?? [])
      .in('model', filter.model ?? [])
      .in('location', filter.location ?? []);

    if (error) throw error;
    return data;
  };

  return {
    filters,
    isLoading,
    addFilter,
    updateFilter,
    deleteFilter,
    applyFilter
  };
} 