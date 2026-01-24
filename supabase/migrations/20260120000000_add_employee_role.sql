-- Migration: Add employee role to profiles table
-- Updates the role constraint to include 'employee' role

-- Drop existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with three roles: admin, employee, client
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'employee', 'client'));

-- Update the is_admin helper function to also check for employee role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create helper function to check if user is employee or admin
CREATE OR REPLACE FUNCTION public.is_employee_or_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'employee')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_employee_or_admin() IS 'Returns true if the current user has admin or employee role';
COMMENT ON FUNCTION public.get_user_role() IS 'Returns the role of the current user';
