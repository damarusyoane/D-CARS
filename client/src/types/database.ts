// Enhanced database type definitions for D-CARS
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar_url: string | null;
  role: 'admin' | 'seller' | 'buyer';
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    new_messages: boolean;
    price_alerts: boolean;
    listing_updates: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'friends';
    show_email: boolean;
    show_phone: boolean;
    allow_messages: boolean;
  };
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  inquiries: number;
  views: number;
  id: string;
  profile_id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: 'new' | 'used' | 'certified';
  description: string | null;
  location: string;
  images: string[];
  status: 'active' | 'sold' | 'pending';
  specifications: {
    transmission: string | null;
    fuel_type: string | null;
    engine_size: string | null;
    color: string | null;
    doors: number | null;
    seats: number | null;
  };
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  vehicle_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  profile_id: string;
  vehicle_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  vehicle_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  vehicle_id: string;
  price: number;
  created_at: string;
}

export interface SearchFilter {
  id: string;
  profile_id: string;
  name: string;
  filters: {
    make?: string[];
    model?: string[];
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: ('new' | 'used' | 'certified')[];
    location?: string[];
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data: Record<string, any> | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  plan_type: 'free' | 'basic' | 'premium' | 'enterprise';
  start_date: string;
  end_date: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  vehicle_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  payment_method: string | null;
  payment_id: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  item_type: 'subscription' | 'feature' | 'service';
  plan_slug?: string;
  feature_slug?: string;
  service_slug?: string;
  vehicle_id?: string;
  billing_period?: 'monthly' | 'yearly';
  quantity: number;
  created_at: string;
}

export interface Feature {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_days: number | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number | null;
  category: string;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  monthly_price: number;
  yearly_price: number;
  features: Record<string, any>;
  listings_allowed: number;
  featured_listings: number;
  analytics_access: boolean;
  priority_support: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// New interfaces for the added tables

export interface VehicleOffer {
  id: string;
  vehicle_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  message: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleReport {
  id: string;
  vehicle_id: string;
  vin: string;
  report_provider: string | null;
  report_url: string | null;
  report_data: Record<string, any> | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleFeature {
  id: string;
  vehicle_id: string;
  feature_slug: string;
  expires_at: string;
  created_at: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Message, 'id' | 'created_at' | 'updated_at'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: never;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Review, 'id' | 'created_at' | 'updated_at'>>;
      };
      price_history: {
        Row: PriceHistory;
        Insert: Omit<PriceHistory, 'id' | 'created_at'>;
        Update: never;
      };
      search_filters: {
        Row: SearchFilter;
        Insert: Omit<SearchFilter, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SearchFilter, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Pick<Notification, 'is_read'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<Transaction, 'status'>>;
      };
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at'>;
        Update: Partial<Pick<CartItem, 'quantity'>>;
      };
      features: {
        Row: Feature;
        Insert: Omit<Feature, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Feature, 'id' | 'created_at' | 'updated_at'>>;
      };
      services: {
        Row: Service;
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>;
      };
      subscription_plans: {
        Row: SubscriptionPlan;
        Insert: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>;
      };
      vehicle_offers: {
        Row: VehicleOffer;
        Insert: Omit<VehicleOffer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Pick<VehicleOffer, 'status'>>;
      };
      vehicle_reports: {
        Row: VehicleReport;
        Insert: Omit<VehicleReport, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VehicleReport, 'id' | 'created_at' | 'updated_at'>>;
      };
      vehicle_features: {
        Row: VehicleFeature;
        Insert: Omit<VehicleFeature, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}; 