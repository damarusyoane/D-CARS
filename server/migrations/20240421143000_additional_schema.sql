-- Add role field to profiles if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer'));
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Create vehicle_offers table for purchase offers
CREATE TABLE IF NOT EXISTS public.vehicle_offers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for vehicle_offers
CREATE INDEX IF NOT EXISTS idx_vehicle_offers_vehicle ON public.vehicle_offers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_offers_buyer ON public.vehicle_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_offers_seller ON public.vehicle_offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_offers_status ON public.vehicle_offers(status);

-- Create vehicle_reports table for vehicle history reports
CREATE TABLE IF NOT EXISTS public.vehicle_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  vin TEXT NOT NULL,
  report_provider TEXT,
  report_url TEXT,
  report_data JSONB,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for vehicle_reports
CREATE INDEX IF NOT EXISTS idx_vehicle_reports_vehicle ON public.vehicle_reports(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_reports_vin ON public.vehicle_reports(vin);

-- Create vehicle_features table for enhanced listing features
CREATE TABLE IF NOT EXISTS public.vehicle_features (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  feature_slug TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for vehicle_features
CREATE INDEX IF NOT EXISTS idx_vehicle_features_vehicle ON public.vehicle_features(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_features_slug ON public.vehicle_features(feature_slug);
CREATE INDEX IF NOT EXISTS idx_vehicle_features_expires ON public.vehicle_features(expires_at);

-- Enable Row Level Security for new tables
ALTER TABLE public.vehicle_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vehicle_offers
CREATE POLICY "Users can view offers they're involved in"
  ON public.vehicle_offers FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create offers"
  ON public.vehicle_offers FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update their own offers"
  ON public.vehicle_offers FOR UPDATE
  USING (auth.uid() = buyer_id AND status = 'pending');

CREATE POLICY "Sellers can respond to offers"
  ON public.vehicle_offers FOR UPDATE
  USING (auth.uid() = seller_id AND status = 'pending');

-- Create RLS policies for vehicle_reports
CREATE POLICY "Vehicle owners can view reports"
  ON public.vehicle_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE id = vehicle_id AND profile_id = auth.uid()
  ));

CREATE POLICY "Admins can add reports"
  ON public.vehicle_reports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Create RLS policies for vehicle_features
CREATE POLICY "Anyone can view vehicle features"
  ON public.vehicle_features FOR SELECT
  USING (true);

CREATE POLICY "Vehicle owners can add features"
  ON public.vehicle_features FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vehicles
    WHERE id = vehicle_id AND profile_id = auth.uid()
  ));

-- Create triggers for updated_at
CREATE TRIGGER update_vehicle_offers_updated_at
  BEFORE UPDATE ON public.vehicle_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicle_reports_updated_at
  BEFORE UPDATE ON public.vehicle_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to include the role field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        phone_number, 
        role
    )
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'phone_number',
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add analytics functions to calculate vehicle statistics
CREATE OR REPLACE FUNCTION public.get_vehicle_statistics(v_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'view_count', (SELECT COUNT(*) FROM public.notifications WHERE data->>'vehicle_id' = v_id::text AND type = 'view'),
        'favorites_count', (SELECT COUNT(*) FROM public.favorites WHERE vehicle_id = v_id),
        'offer_count', (SELECT COUNT(*) FROM public.vehicle_offers WHERE vehicle_id = v_id),
        'message_count', (SELECT COUNT(*) FROM public.messages WHERE vehicle_id = v_id),
        'avg_offer', (SELECT COALESCE(AVG(amount), 0) FROM public.vehicle_offers WHERE vehicle_id = v_id),
        'days_listed', (SELECT EXTRACT(DAY FROM (NOW() - created_at)) FROM public.vehicles WHERE id = v_id)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Seed some initial admin users if needed
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin' LIMIT 1) THEN
        UPDATE public.profiles
        SET role = 'admin'
        WHERE email = 'admin@d-cars.com';
    END IF;
END
$$;
