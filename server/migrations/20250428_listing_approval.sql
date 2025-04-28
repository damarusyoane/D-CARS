-- Migration for listing approval workflow
-- 1. Change default status to 'pending'
ALTER TABLE public.vehicles ALTER COLUMN status SET DEFAULT 'pending';

-- 2. (Optional) Add 'rejected' status if not already present
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_status_check CHECK (status IN ('active', 'sold', 'pending', 'rejected'));

-- 3. Enable RLS if not already enabled
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Only allow users to insert listings as 'pending'
DROP POLICY IF EXISTS "Authenticated can insert vehicles" ON public.vehicles;
CREATE POLICY "Users can create pending listings"
  ON public.vehicles FOR INSERT
  WITH CHECK (
    auth.uid() = profile_id AND status = 'pending'
  );

-- 5. Policy: Only admins can approve/reject listings (change status)
DROP POLICY IF EXISTS "Authenticated can update vehicles" ON public.vehicles;
CREATE POLICY "Admins can approve or reject listings"
  ON public.vehicles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Policy: Users can update their own pending listings (except status)
CREATE POLICY "Users can update their own pending listings (not status)"
  ON public.vehicles FOR UPDATE
  USING (
    auth.uid() = profile_id AND status = 'pending'
  )
  WITH CHECK (
    status = 'pending'
  );

-- 7. Policy: Users can select their own listings, admins can select all
DROP POLICY IF EXISTS "Authenticated can select vehicles" ON public.vehicles;
CREATE POLICY "Users can view their own listings"
  ON public.vehicles FOR SELECT
  USING (
    auth.uid() = profile_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
