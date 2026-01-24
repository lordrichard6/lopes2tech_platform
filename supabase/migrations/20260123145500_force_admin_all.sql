-- Grants admin role to ALL users to resolve permission issues in dev environment
-- This ensures the current user (whatever email they use) matches the RLS 'admin' check

UPDATE profiles 
SET role = 'admin' 
WHERE role != 'admin' OR role IS NULL;
