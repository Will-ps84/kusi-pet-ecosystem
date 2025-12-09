-- Step 1: Drop the overly permissive policy that exposes all columns
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;

-- Step 2: Create a secure view that only exposes non-sensitive columns
CREATE OR REPLACE VIEW public.public_vendors AS
SELECT 
  id,
  business_name,
  is_active
FROM public.vendors
WHERE is_active = true;

-- Step 3: Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.public_vendors TO anon;
GRANT SELECT ON public.public_vendors TO authenticated;

-- Note: The vendors table still has these policies intact:
-- - "Admins can manage all vendors" (ALL for admins)
-- - "Users can create vendor profile" (INSERT for own user_id)
-- - "Vendors can update own profile" (UPDATE for own user_id)
-- - "Vendors can view own profile" (SELECT for own user_id)
-- This means admins and the vendor owner can still see all columns.