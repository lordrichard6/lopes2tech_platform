-- Seed file for test users
-- This creates test accounts for development

-- Create admin user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@lopes2tech.ch',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Paulo Lopes", "role": "admin"}'::jsonb,
    'authenticated',
    'authenticated'
);

-- Create employee user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'employee@lopes2tech.ch',
    crypt('employee123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Test Employee", "role": "employee"}'::jsonb,
    'authenticated',
    'authenticated'
);

-- Create client user
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    role,
    aud
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'client@gmail.com',
    crypt('client123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Test Client", "role": "client"}'::jsonb,
    'authenticated',
    'authenticated'
);

-- The trigger will auto-create profiles, but we need to update them with correct roles
UPDATE public.profiles SET role = 'admin' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET role = 'employee' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET role = 'client' WHERE id = '00000000-0000-0000-0000-000000000003';
