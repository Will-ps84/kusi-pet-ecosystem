-- First, drop any existing policies that might conflict (if they exist)
-- We'll recreate them with the proper configuration

-- Drop existing SELECT policies to recreate with proper setup
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users base access" ON public.profiles;

-- Create base PERMISSIVE policy requiring authentication
-- This is the first gate: must be authenticated
CREATE POLICY "Authenticated users base access"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Create RESTRICTIVE policy: users can only see their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create RESTRICTIVE policy: admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- UPDATE policy: users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Explicit deny for anonymous role on all operations
CREATE POLICY "Deny anonymous SELECT"
ON public.profiles
FOR SELECT
TO anon
USING (false);

CREATE POLICY "Deny anonymous INSERT"
ON public.profiles
FOR INSERT
TO anon
WITH CHECK (false);

CREATE POLICY "Deny anonymous UPDATE"
ON public.profiles
FOR UPDATE
TO anon
USING (false);

CREATE POLICY "Deny anonymous DELETE"
ON public.profiles
FOR DELETE
TO anon
USING (false);