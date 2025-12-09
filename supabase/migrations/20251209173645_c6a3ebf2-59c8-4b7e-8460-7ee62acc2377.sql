-- Drop the policy we just created - it still exposes sensitive data
DROP POLICY IF EXISTS "Public can view basic vendor info only" ON public.vendors;

-- Create a security definer function to safely return only public vendor data
CREATE OR REPLACE FUNCTION public.get_public_vendors()
RETURNS TABLE(id uuid, business_name text, is_active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.business_name, v.is_active
  FROM public.vendors v
  WHERE v.is_active = true;
$$;