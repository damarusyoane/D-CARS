import { createContext, useContext, useEffect, useMemo, useCallback, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Provider, AuthError } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { UserRole, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    role: UserRole
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const queryClient = useQueryClient();

  const checkEmailVerification = useCallback((user: User): boolean => {
    return !!user.email_confirmed_at || !!user.identities?.some(identity => identity.provider !== 'email');
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error?.code === 'PGRST116') {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email,
            full_name: user?.user_metadata?.full_name || '',
            phone_number: user?.user_metadata?.phone_number || '',
            role: user?.user_metadata?.role || 'buyer',
          })
          .select()
          .single();
        return setProfile(newProfile);
      }

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Profile error:', error);
      toast.error('Failed to load profile data');
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser(session.user);
          setIsEmailVerified(checkEmailVerification(session.user));
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth init error:', error);
        toast.error('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        switch (event) {
          case 'SIGNED_IN':
          case 'USER_UPDATED':
            if (session?.user) {
              setUser(session.user);
              setIsEmailVerified(checkEmailVerification(session.user));
              await fetchProfile(session.user.id);
              toast.success('Signed in successfully!');
            }
            break;

          case 'SIGNED_OUT':
            setUser(null);
            setProfile(null);
            setIsEmailVerified(false);
            queryClient.clear();
            break;

          default:
            break;
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, [checkEmailVerification, fetchProfile, queryClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setIsEmailVerified(checkEmailVerification(data.user));
        await fetchProfile(data.user.id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  }, [checkEmailVerification, fetchProfile]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
    role: UserRole
  ) => {
    try {
      console.log('Attempting to sign up with:', { email, password: '***', fullName, phoneNumber, role });
      
      // First, create the user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_metadata: {
              full_name: fullName,
              phone_number: phoneNumber,
              role
            }
          }
        }
      });

      console.log('Auth response:', { authData, authError });

      if (authError) {
        console.error('Auth signup error details:', {
          message: authError.message,
          code: authError.code,
          status: authError.status
        });
        return { error: authError };
      }

      if (!authData.user) {
        console.error('No user created in auth response:', authData);
        return { error: { message: 'No user created', code: 'no_user_created', status: 400, __isAuthError: true } as unknown as AuthError };
      }

      // Create profile immediately
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        phone_number: phoneNumber,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_admin: role === 'admin',
        two_factor_enabled: false,
        notification_preferences: JSON.stringify({}),
        privacy_settings: JSON.stringify({}),
        avatar_url: null,
        two_factor_secret: null
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { error: { message: 'Failed to create profile', code: 'profile_creation_failed', status: 400, __isAuthError: true } as unknown as AuthError };
      }

      console.log('Profile creation response:', { profileError });

      if (profileError) {
        console.error('Profile creation error details:', {
          message: profileError.message,
          code: profileError.code
        });
        return { error: { message: 'Failed to create profile', code: 'profile_creation_failed', status: 400, __isAuthError: true } as unknown as AuthError };
      }

      // Sign in the user immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Sign in response:', { signInError });

      if (signInError) {
        console.error('Sign in error details:', {
          message: signInError.message,
          code: signInError.code
        });
        return { error: signInError };
      }

      return { error: null };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      return { error: { message, code: 'custom_error', status: 400, __isAuthError: true } as unknown as AuthError };
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      queryClient.clear();
      ['sb-access-token', 'sb-refresh-token'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      toast.success('Signed out successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      toast.error(message);
      throw error;
    }
  }, [queryClient]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password update failed';
      toast.error(message);
      throw error;
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    try {
      if (!user?.email) throw new Error('No email address found');
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });
      if (error) throw error;
      toast.success('Verification email resent');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend email';
      toast.error(message);
      throw error;
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    resendVerificationEmail
  }), [
    user,
    profile,
    isLoading,
    isEmailVerified,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    resendVerificationEmail
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}