-- Add explicit denial policy for anonymous users on vendors table
-- This ensures anonymous users cannot query the vendors table directly
CREATE POLICY "Deny public access to vendors"
ON public.vendors
FOR SELECT
TO anon
USING (false);