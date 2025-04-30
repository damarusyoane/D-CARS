import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
// Import components with explicit path to avoid module resolution issues
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { Outlet } from 'react-router-dom';

// Public Pages
const HomePage = lazy(() => import('./pages/Index'));
const Search = lazy(() => import('./pages/Search'));
const VehicleDetails = lazy(() => import('./pages/VehicleDetails'));
const SellerProfile = lazy(() => import('./pages/SellerProfile'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Subscription = lazy(() => import('./pages/Subscription'));
const Cart = lazy(() => import('./pages/Cart'));

// Auth Pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminRegister = lazy(() => import('./pages/AdminRegister'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

// User Dashboard Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const Profile = lazy(() => import('./pages/Profile'));
const SavedCars = lazy(() => import('./pages/SavedCars'));
const MyListings = lazy(() => import('./pages/MyListings'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const EditListing = lazy(() => import('./pages/EditListing'));
const Transactions = lazy(() => import('./pages/Transactions'));
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'));
const Settings = lazy(() => import('./pages/Settings'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Error Pages
const NotFound = lazy(() => import('./pages/NotFound'));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout><Outlet /></MainLayout>}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<Search />} />
            <Route path="cars/:id" element={<VehicleDetails />} />
            <Route path="seller/:sellerId" element={<SellerProfile />} />
            <Route path="search" element={<Search />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="contact-us" element={<ContactUs />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout><Outlet /></AuthLayout>}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="callback" element={<AuthCallback />} />
          </Route>

          {/* Admin Auth Routes */}
          <Route path="/admin">
            <Route path="login" element={<AdminLogin />} />
            <Route path="register" element={<AdminRegister />} />
            
            {/* Protected Admin Routes */}
            <Route element={<AdminRoute><AdminLayout><Outlet /></AdminLayout></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute><MainLayout><Outlet /></MainLayout></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/profile" element={<Profile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/messages" element={<Messages />} />
            <Route path="/dashboard/saved" element={<SavedCars />} />
            <Route path="/dashboard/my-listings" element={<MyListings />} />
            <Route path="/dashboard/create-listing" element={<CreateListing />} />
            <Route path="/dashboard/edit-listing/:id" element={<EditListing />} />
            <Route path="/dashboard/transactions" element={<Transactions />} />
            <Route path="/dashboard/transaction-history" element={<TransactionHistory />} />
          </Route>

          {/* 404 Route */}
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default AppRoutes;