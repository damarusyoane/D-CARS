# Database Setup Guide for D-CARS

This guide will help you set up both Supabase (PostgreSQL) and MongoDB databases for D-CARS.

## Supabase Setup

### 1. Tables Structure

Create the following tables in Supabase:

```sql
-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  phone_number text unique,
  email text unique,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  plan_type text,
  status text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Vehicles table
create table public.vehicles (
  id uuid default uuid_generate_v4(),
  seller_id uuid references public.profiles(id),
  title text,
  description text,
  price numeric,
  year integer,
  make text,
  model text,
  mileage numeric,
  condition text,
  location text,
  images text[],
  features jsonb,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4(),
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  content text,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);

-- Reviews table
create table public.reviews (
  id uuid default uuid_generate_v4(),
  reviewer_id uuid references public.profiles(id),
  reviewed_id uuid references public.profiles(id),
  vehicle_id uuid references public.vehicles(id),
  rating integer,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  primary key (id)
);
```

### 2. Enable Authentication Providers

1. Go to Authentication > Providers
2. Enable the following:
   - Email
   - Phone (Twilio)
   - Google
   - hCaptcha

### 3. Configure Email Templates

1. Go to Authentication > Email Templates
2. Set up templates for:
   - Confirmation
   - Reset password
   - Magic link
   - Change email

### 4. Set up Storage Buckets

1. Create the following storage buckets:
   - `vehicle-images`
   - `profile-avatars`
2. Set up appropriate security policies

## MongoDB Setup

### 1. Collections Structure

Create the following collections:

```javascript
// vehicle_analytics
{
  vehicle_id: UUID,
  views: Number,
  favorites: Number,
  inquiries: Number,
  last_viewed: Date,
  view_history: [{
    user_id: UUID,
    timestamp: Date
  }]
}

// user_preferences
{
  user_id: UUID,
  saved_searches: [{
    criteria: Object,
    name: String,
    created_at: Date
  }],
  favorite_vehicles: [UUID],
  notification_settings: {
    email: Boolean,
    push: Boolean,
    sms: Boolean
  }
}

// activity_logs
{
  user_id: UUID,
  action: String,
  details: Object,
  timestamp: Date,
  ip_address: String
}
```

### 2. Indexes

Create the following indexes:

```javascript
// vehicle_analytics
db.vehicle_analytics.createIndex({ "vehicle_id": 1 }, { unique: true })
db.vehicle_analytics.createIndex({ "views": -1 })

// user_preferences
db.user_preferences.createIndex({ "user_id": 1 }, { unique: true })
db.user_preferences.createIndex({ "favorite_vehicles": 1 })

// activity_logs
db.activity_logs.createIndex({ "user_id": 1 })
db.activity_logs.createIndex({ "timestamp": -1 })
```

## Environment Variables

Add these variables to your `.env` files:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# MongoDB
MONGODB_URI=your_mongodb_uri
MONGODB_DB_NAME=d_cars

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token

# Resend
RESEND_API_KEY=your_resend_api_key

# hCaptcha
HCAPTCHA_SITE_KEY=your_hcaptcha_site_key
HCAPTCHA_SECRET_KEY=your_hcaptcha_secret_key
```

## Security Considerations

1. Set up Row Level Security (RLS) policies in Supabase
2. Configure proper network access in MongoDB Atlas
3. Use environment variables for all sensitive credentials
4. Implement rate limiting for API endpoints
5. Regular backup schedule for both databases 