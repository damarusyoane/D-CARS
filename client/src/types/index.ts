export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}

export interface Vehicle {
    id: string;
    user_id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage: number;
    condition: 'new' | 'used' | 'certified';
    description?: string;
    location: string;
    images: string[];
    status: 'pending' | 'active' | 'sold' | 'rejected';
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

export interface Notification {
    id: string;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

export interface SearchFilters {
    make?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    condition?: string;
} 
export interface Profile {
    id: string;
    email: string;
    full_name: string;
    phone_number: string;
    avatar_url?: string | null;
    role: UserRole;
    created_at: string;
    updated_at: string;
}