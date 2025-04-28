// useSessionAwareRefresh.ts
// React hook to refetch data on Supabase auth/session changes
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSessionAwareRefresh(refetch: () => void) {
  useEffect(() => {
    // Listen for all auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, _session) => {
      refetch();
    });
    return () => subscription.unsubscribe();
  }, [refetch]);
}
