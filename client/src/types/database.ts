export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar_url: string | null;
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
    };
  };
}; 