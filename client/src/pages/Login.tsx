// client/src/pages/Login.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            console.log('Attempting login for:', email);
            
            // Use AuthContext's signIn to handle login and state
            await signIn(email, password);
            
            // Fetch profile to check role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('email', email)
                .single();
    
            if (profileError) {
                console.error('Profile fetch error:', profileError);
                
                // If profile doesn't exist, try to create it
                const { data: userData } = await supabase.auth.getUser();
                
                if (userData?.user) {
                    const { error: createProfileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: userData.user.id,
                            email: email,
                            full_name: userData.user.user_metadata.full_name || '',
                            phone_number: userData.user.user_metadata.phone_number || '',
                            role: userData.user.user_metadata.role || 'buyer',
                            notification_preferences: {
                                email: true,
                                push: true,
                                sms: false,
                                new_messages: true,
                                price_alerts: true,
                                listing_updates: true
                            },
                            privacy_settings: {
                                profile_visibility: 'public',
                                show_email: false,
                                show_phone: true,
                                allow_messages: true
                            },
                            avatar_url: null,
                            two_factor_enabled: false,
                            two_factor_secret: null
                        }, { onConflict: 'id' });
                    
                    if (createProfileError) {
                        console.error('Profile creation error:', createProfileError);
                        toast.error('Impossible de récupérer ou créer le profil utilisateur');
                        setIsLoading(false);
                        return;
                    }
                    
                    // Fetch the newly created profile
                    const { data: newProfile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('email', email)
                        .single();
                        
                    if (newProfile) {
                        // Navigate based on new profile role
                        if (newProfile.role === 'admin') {
                            navigate('/admin', { replace: true });
                        } else if (newProfile.role === 'seller') {
                            navigate('/dashboard/my-listings', { replace: true });
                        } else {
                            navigate('/dashboard/search', { replace: true });
                        }
                        setIsLoading(false);
                        return;
                    }
                }
                
                toast.error('Impossible de récupérer le profil utilisateur');
                setIsLoading(false);
                return;
            }
    
            // Redirect based on role
            if (profile?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (profile?.role === 'seller') {
                navigate('/dashboard/my-listings', { replace: true });
            } else {
                navigate('/dashboard/search', { replace: true });
            }
            
            toast.success(t('login.success') || 'Connecté avec succès!');
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                if (error.message.toLowerCase().includes('invalid login credentials')) {
                    toast.error(t('login.invalidCredentials') || 'Identifiants invalides. Veuillez réessayer.');
                } else if (error.message.toLowerCase().includes('email not confirmed')) {
                    toast.error(t('login.emailNotConfirmed') || 'Veuillez confirmer votre email avant de vous connecter.');
                } else {
                    toast.error(error.message);
                }
            } else {
                toast.error(t('login.error') || 'Une erreur est survenue lors de la connexion');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
    
            if (error) {
                console.error('Google login error:', error);
                if (error.message.includes('OAuth secret')) {
                    toast.error(t('login.googleConfigError') || 'La connexion Google n\'est pas configurée correctement. Veuillez contacter le support.');
                } else {
                    toast.error(t('login.googleError') || 'Erreur lors de la connexion avec Google');
                }
            }
        } catch (error) {
            console.error('Google login error:', error);
            toast.error(t('login.googleError') || 'Erreur lors de la connexion avec Google');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-8 sm:px-10">
                    <div className="text-center">
                        <img
                            className="mx-auto h-16 w-auto"
                            src="/assets/logo.png"
                            alt="D-CARS"
                        />
                        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Connexion
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Connectez-vous à votre compte
                        </p>
                    </div>
    
                    <div className="mt-8">
                        <div>
                            <div>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                            <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                            <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                     </g> 
                                    </svg>
                                    Continuer avec Google
                                </button>
                            </div>
    
                            <div className="mt-6 relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                        Ou
                                    </span>
                                </div>
                            </div>
                        </div>
    
                        <div className="mt-6">
                            <form className="space-y-6" onSubmit={handleEmailLogin}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                                            placeholder="tagne@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
    
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Mot de passe
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
    
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                            Se souvenir de moi
                                        </label>
                                    </div>
                                </div>
    
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {isLoading ? 'Chargement...' : 'Connexion'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 sm:px-10">
                    <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                        Pas de compte ?{' '}
                        <Link to="/auth/register" className="font-medium text-primary-600 dark:text-primary-500 hover:text-primary-500 dark:hover:text-primary-400">
                            Inscrivez-vous maintenant
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}