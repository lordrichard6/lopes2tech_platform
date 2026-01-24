-- Ensure the main admin user has the 'admin' role
-- This prevents RLS issues if the user was created with default 'client' role

UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email = 'admin@lopes2tech.ch'
);

-- Also update any user that has 'admin' in their email just for dev convenience
UPDATE profiles
SET role = 'admin'
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email LIKE '%confirmed_admin%'
);
