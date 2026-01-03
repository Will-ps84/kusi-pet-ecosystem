-- Drop the overly permissive public policy that exposes all orders
DROP POLICY IF EXISTS "Public can view orders by tracking token" ON public.orders;

-- Create a properly restricted policy that requires the tracking_token to be provided
-- This allows the Tracking page to work without authentication, but only for a specific order
-- Note: Since RLS policies can't access request parameters directly, we need an alternative approach
-- The safest solution is to create an RPC function that validates the tracking token

-- Create a function to get order by tracking token (returns limited fields only)
CREATE OR REPLACE FUNCTION public.get_order_by_tracking_token(p_tracking_token uuid)
RETURNS TABLE(
  id uuid,
  status order_status,
  district text,
  delivery_address text,
  delivery_window text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.status,
    o.district,
    o.delivery_address,
    o.delivery_window,
    o.created_at
  FROM public.orders o
  WHERE o.tracking_token = p_tracking_token;
$$;