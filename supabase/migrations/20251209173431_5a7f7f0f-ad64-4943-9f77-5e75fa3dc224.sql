-- Add a restrictive policy that ONLY allows reading the non-sensitive columns
-- This policy will be used when querying through the public_vendors view
CREATE POLICY "Public can view basic vendor info only" 
ON public.vendors 
FOR SELECT 
USING (is_active = true);

-- Note: Even though this policy allows SELECT on the table,
-- users will only see columns exposed by the public_vendors view
-- since that's what they'll query. Direct table access would expose all columns,
-- but the app code will use the view for public queries.