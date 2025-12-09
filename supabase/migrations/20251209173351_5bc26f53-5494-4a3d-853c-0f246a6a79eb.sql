-- Fix: Recreate view with SECURITY INVOKER (not DEFINER)
-- This ensures the view respects the querying user's permissions
DROP VIEW IF EXISTS public.public_vendors;

CREATE VIEW public.public_vendors 
WITH (security_invoker = true) AS
SELECT 
  id,
  business_name,
  is_active
FROM public.vendors
WHERE is_active = true;

-- Re-grant SELECT permissions
GRANT SELECT ON public.public_vendors TO anon;
GRANT SELECT ON public.public_vendors TO authenticated;