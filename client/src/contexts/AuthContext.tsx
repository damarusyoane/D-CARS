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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

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

    useEffect(() => {
        console.log('[AuthProvider] Checking session...');
        let timeoutId: NodeJS.Timeout | null = null;
        // Timeout fallback for loading
        timeoutId = setTimeout(() => {
            if (isLoading) {
                console.error('[AuthProvider] Timed out waiting for auth.');
                setIsLoading(false);
                toast.error('Timed out waiting for auth. Please try again.');
            }
        }, 5000);

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            console.log('[AuthProvider] Session:', session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setIsEmailVerified(session.user.email_confirmed_at != null);
                await checkTwoFactorStatus(session.user.id);
            }
            setIsLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
        }).catch((err) => {
            console.error('[AuthProvider] Error getting session:', err);
            setIsLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
            toast.error('Error getting session. Please try again.');
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('[AuthProvider] Auth state change:', _event, session);
            setUser(session?.user ?? null);
            if (session?.user) {
                setIsEmailVerified(session.user.email_confirmed_at != null);
                await checkTwoFactorStatus(session.user.id);
            }
            setIsLoading(false);
            if (timeoutId) clearTimeout(timeoutId);
        });

        return () => {
            subscription.unsubscribe();
            if (timeoutId) clearTimeout(timeoutId);
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
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success('Successfully signed out!');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to sign out');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
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
        }}>
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