// client/src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuth = async () => {
      // Wait for Supabase session to be restored
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        toast.error('Authentication failed.');
        navigate('/auth/login', { replace: true });
        return;
      }
      const userId = userData.user.id;
      let userProfile = null;
      try {
        // Try to fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        // If there is any error OR no profile found, insert a new profile
        if (profileError || !profile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: userId,
            email: userData.user.email,
            full_name: userData.user.user_metadata?.full_name || '',
            phone_number: userData.user.user_metadata?.phone_number || '',
            role: 'buyer',
          });
          if (insertError) {
            toast.error('Failed to create profile.');
            navigate('/dashboard/profile', { replace: true });
            return;
          }
          userProfile = { role: 'buyer' };
        } else {
          userProfile = profile;
        }
      } catch (err) {
        toast.error('Error during authentication.');
        navigate('/dashboard/profile', { replace: true });
        return;
      }
      // Redirect based on role
      if (userProfile?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userProfile?.role === 'seller') {
        navigate('/dashboard/my-listings', { replace: true });
      } else {
        navigate('/dashboard/profile', { replace: true });
      }
    };
    handleOAuth();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-lg">Authenticating...</div>
    </div>
  );
}
