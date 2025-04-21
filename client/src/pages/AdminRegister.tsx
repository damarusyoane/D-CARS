import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheckIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminRegister() {
  const navigate = useNavigate();
  useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword || !fullName || !adminCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Verify admin registration code
    // In production, this should be managed securely through environment variables
    // or a database of valid admin invite codes
    const ADMIN_REGISTRATION_CODE = 'DCARS-ADMIN-2025';
    
    if (adminCode !== ADMIN_REGISTRATION_CODE) {
      toast.error('Invalid admin registration code');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Register the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });
      
      if (error) throw error;
      
      // Update the profile in the database to include the admin role
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            email: email,
            role: 'admin',
            updated_at: new Date().toISOString()
          });
        
        if (profileError) throw profileError;
      }
      
      toast.success('Admin account created! Please verify your email.');
      navigate('/admin/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create admin account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-500/20 rounded-full">
              <ShieldCheckIcon className="h-10 w-10 text-purple-500" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Create Admin Account</h2>
          <p className="text-gray-400">Register a new administrator account</p>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="admin@example.com"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="u2022u2022u2022u2022u2022u2022u2022u2022"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="u2022u2022u2022u2022u2022u2022u2022u2022"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="adminCode" className="block text-sm font-medium text-gray-400 mb-2">Admin Registration Code</label>
              <input
                id="adminCode"
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter admin code"
                required
              />
              <p className="mt-1 text-xs text-gray-500">This code is provided by the system administrator</p>
            </div>
            
            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <UserPlusIcon className="h-5 w-5 mr-2" />
                    Register Admin Account
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="text-sm text-center text-gray-400">
            <p>Already have an admin account?</p>
            <Link to="/admin/login" className="text-purple-400 hover:text-purple-300">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
