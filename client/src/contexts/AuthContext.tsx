import  { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User, Provider, AuthResponse } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    signIn: (email: string, password: string, code?: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    signInWithProvider: (provider: Provider) => Promise<void>;
    enableTwoFactor: () => Promise<string>;
    verifyTwoFactor: (code: string) => Promise<void>;
    disableTwoFactor: (code: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
}

interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string | null;
    role: 'admin' | 'seller' | 'buyer';
    notification_preferences?: any;
    privacy_settings?: any;
    two_factor_enabled: boolean;
    two_factor_secret?: string | null;
    created_at?: string;
    updated_at?: string;
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useQueryClient } from '@tanstack/react-query';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
    // React Query client for cache invalidation
    const queryClient = useQueryClient();

    // Fetch profile when user changes
    useEffect(() => {
        if (user) {
            supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
                .then(({ data, error }) => {
                    if (!error && data) setProfile(data);
                    else setProfile(null);
                });
        } else {
            setProfile(null);
        }
    }, [user]);

    // Initialize auth and ensure session persistence
    useEffect(() => {
        console.log('[AuthProvider] Initializing auth context...');

        // Initialize Supabase session persistence with localStorage
        // This ensures user sessions are kept between page refreshes
        // Invalidate all queries to ensure fresh data after session (re)hydration
        const invalidateAll = () => {
            if (queryClient) {
                queryClient.invalidateQueries();
            }
        };

        const initializeAuth = async () => {
            try {
                // Check for existing session
                console.log('[AuthProvider] Calling supabase.auth.getSession...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.error('[AuthProvider] getSession error:', sessionError);
                    // Only clear storage and force logout if there was a session error (i.e., user expected to be authenticated)
                    [localStorage, sessionStorage].forEach(storage => {
                        Object.keys(storage)
                            .filter(key => key.startsWith('sb-'))
                            .forEach(key => storage.removeItem(key));
                    });
                    document.cookie.split(';').forEach(cookie => {
                        const name = cookie.split('=')[0].trim();
                        if (name.includes('sb-')) {
                            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
                        }
                    });
                    if ('indexedDB' in window) {
                        try { window.indexedDB.deleteDatabase('supabase-auth-client'); } catch (e) {}
                    }
                    setUser(null);
                    setProfile(null);
                    setIsEmailVerified(false);
                    setIsTwoFactorEnabled(false);
                    setIsLoading(false);
                    toast.error('Session expired or invalid. Please log in again.');
                    setTimeout(() => {
                        window.location.href = '/auth/login';
                    }, 500);
                    return;
                } else if (!session) {
                    // If there is simply no session (anonymous visitor), just set user/profile to null and proceed
                    setUser(null);
                    setProfile(null);
                    setIsEmailVerified(false);
                    setIsTwoFactorEnabled(false);
                    setIsLoading(false);
                    return;
                }
                setIsEmailVerified(session.user.email_confirmed_at != null);
                await checkTwoFactorStatus(session.user.id);

                // Try to sync with profile data
                try {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (!profileError && profileData) {
                        setProfile(profileData);
                    }
                } catch (profileErr) {
                    console.error('[AuthProvider] Error fetching profile:', profileErr);
                }

                setIsLoading(false);
                invalidateAll();
            } catch (err) {
                console.error('[AuthProvider] Error initializing auth:', err);
                setIsLoading(false);
                toast.error('Failed to initialize authentication. Please try again.');
            }
        };
        
        initializeAuth();

        // Listen for auth state changes (login, logout, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[AuthProvider] Auth state change: ${event}`, session);
            
            // Handle different auth events
            switch (event) {
                case 'SIGNED_IN':
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        setIsEmailVerified(session.user.email_confirmed_at != null);
                        await checkTwoFactorStatus(session.user.id);
                        // Fetch profile after sign in
                        try {
                            const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();
                            if (!profileError && profileData) {
                                setProfile(profileData);
                            } else {
                                setProfile(null);
                            }
                        } catch (profileErr) {
                            setProfile(null);
                            console.error('[AuthProvider] Error fetching profile after SIGNED_IN:', profileErr);
                        }
                        toast.success('Signed in successfully!');
                    }
                    invalidateAll();
                    setIsLoading(false);
                    break;
                case 'SIGNED_OUT':
                    setUser(null);
                    setProfile(null);
                    setIsEmailVerified(false);
                    setIsTwoFactorEnabled(false);
                    invalidateAll();
                    // No toast here as signOut method handles this
                    break;
                case 'TOKEN_REFRESHED':
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        // Fetch profile after token refresh
                        try {
                            const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();
                            if (!profileError && profileData) {
                                setProfile(profileData);
                            } else {
                                setProfile(null);
                            }
                        } catch (profileErr) {
                            setProfile(null);
                            console.error('[AuthProvider] Error fetching profile after TOKEN_REFRESHED:', profileErr);
                        }
                    }
                    invalidateAll();
                    setIsLoading(false);
                    // Silent refresh, no need to notify
                    break;
                case 'USER_UPDATED':
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        setIsEmailVerified(session.user.email_confirmed_at != null);
                        await checkTwoFactorStatus(session.user.id);
                        // Fetch profile after user update
                        try {
                            const { data: profileData, error: profileError } = await supabase
                                .from('profiles')
                                .select('*')
                                .eq('id', session.user.id)
                                .single();
                            if (!profileError && profileData) {
                                setProfile(profileData);
                            } else {
                                setProfile(null);
                            }
                        } catch (profileErr) {
                            setProfile(null);
                            console.error('[AuthProvider] Error fetching profile after USER_UPDATED:', profileErr);
                        }
                    }
                    setIsLoading(false);
                    break;
                default:
                    setUser(session?.user ?? null);
                    break;
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkTwoFactorStatus = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('two_factor_enabled')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            setIsTwoFactorEnabled(data.two_factor_enabled);
        } catch (error) {
            console.error('Error checking 2FA status:', error);
        }
    };

    const signIn = async (email: string, password: string, code?: string) => {
        try {
            let authResponse: AuthResponse;

            if (code) {
                // Sign in with 2FA
                const signInOptions = {
                    email,
                    password,
                };
                authResponse = await supabase.auth.signInWithPassword(signInOptions);

                // Verify 2FA code separately
                const { error: verifyError } = await supabase.functions.invoke('verify-2fa', {
                    body: { code }
                });
                if (verifyError) throw verifyError;
            } else {
                // Regular sign in
                authResponse = await supabase.auth.signInWithPassword({ email, password });
            }

            if (authResponse.error) throw authResponse.error;

        // No email confirmation check needed; allow all authenticated users to proceed
        toast.success('Successfully signed in!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to sign in');
            throw error;
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { 
                        name,
                        two_factor_enabled: false
                    }
                }
            });
            if (error) throw error;
            toast.success('Registration successful! Please check your email for verification.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to sign up');
            throw error;
        }
    };

    const signInWithProvider = async (provider: Provider) => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to sign in');
            throw error;
        }
    };

    const enableTwoFactor = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('generate-2fa-secret');
            if (error) throw error;

            await supabase
                .from('profiles')
                .update({ 
                    two_factor_secret: data.secret,
                    two_factor_enabled: false 
                })
                .eq('id', user?.id);

            return data.qrCode;
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to enable 2FA');
            throw error;
        }
    };

    const verifyTwoFactor = async (code: string) => {
        try {
            const { error } = await supabase.functions.invoke('verify-2fa', {
                body: { code }
            });
            if (error) throw error;

            await supabase
                .from('profiles')
                .update({ two_factor_enabled: true })
                .eq('id', user?.id);

            setIsTwoFactorEnabled(true);
            toast.success('Two-factor authentication enabled successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid verification code');
            throw error;
        }
    };

    const disableTwoFactor = async (code: string) => {
        try {
            const { error } = await supabase.functions.invoke('verify-2fa', {
                body: { code }
            });
            if (error) throw error;

            await supabase
                .from('profiles')
                .update({ 
                    two_factor_enabled: false,
                    two_factor_secret: null
                })
                .eq('id', user?.id);

            setIsTwoFactorEnabled(false);
            toast.success('Two-factor authentication disabled successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid verification code');
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });
            if (error) throw error;
            toast.success('Password reset instructions sent to your email!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send reset instructions');
            throw error;
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;
            toast.success('Password updated successfully!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update password');
            throw error;
        }
    };

    const resendVerificationEmail = async () => {
        try {
            if (!user?.email) throw new Error('No email address found');
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: user.email
            });
            if (error) throw error;
            toast.success('Verification email sent!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send verification email');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            // First try the standard signOut method
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear any cached user data
            setUser(null);
            setProfile(null);
            setIsEmailVerified(false);
            setIsTwoFactorEnabled(false);
            
            // Force clear any local storage related to Supabase
            [localStorage, sessionStorage].forEach(storage => {
                Object.keys(storage)
                    .filter(key => key.startsWith('sb-'))
                    .forEach(key => storage.removeItem(key));
            });
            
            // Try to clear IndexedDB if available (contains token data)
            if ('indexedDB' in window) {
                try { 
                    window.indexedDB.deleteDatabase('supabase-auth-db');
                    window.indexedDB.deleteDatabase('supabase-auth-token-storage');
                } catch (e) {
                    console.error('Error clearing IndexedDB:', e);
                }
            }
            
            // Clear any cookies
            document.cookie.split(';').forEach(cookie => {
                const [name] = cookie.trim().split('=');
                if (name.includes('sb-')) {
                    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
                }
            });
            
            toast.success('Successfully signed out!');
            
            // Force page reload for complete clean state
            setTimeout(() => {
                window.location.href = '/'; // Navigate to home page
            }, 500);
            
        } catch (error) {
            console.error('Sign out error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to sign out');
            throw error;
        }
    };

    const value = {
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isEmailVerified,
        isTwoFactorEnabled,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        signInWithProvider,
        enableTwoFactor,
        verifyTwoFactor,
        disableTwoFactor,
        resendVerificationEmail
    };

    // Only block rendering during the initial auth check, not on every profile fetch
    if (isLoading && user === null) {
        return <div className="flex items-center justify-center min-h-screen"><span>Loading authentication...</span></div>;
    }
    return (
        <AuthContext.Provider value={value}>
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

export default AuthContext; 