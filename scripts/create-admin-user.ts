import { createClient } from '@supabase/supabase-js';

// Environment variables are passed explicitly via command line
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    console.error('Make sure they are set in your .env or .env.local file, or passed as environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function createAdminUser() {
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
        console.error('Usage: npx tsx scripts/create-admin-user.ts <email> <password>');
        process.exit(1);
    }

    console.log(`Checking user: ${email}...`);

    // 1. Check if user exists (by trying to create, or listing)
    // safe approach: try create, if fail with "already registered", then get ID.

    let userId = '';

    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (createError) {
        // If user already exists, we need to fetch their ID
        if (createError.message.includes('already registered') || createError.status === 422) {
            console.log('User already exists. Fetching ID...');

            // List users to find the ID (Admin API)
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error('Error listing users:', listError.message);
                process.exit(1);
            }

            const existingUser = users.users.find(u => u.email === email);
            if (!existingUser) {
                // Should not happen if create failed with "already registered"
                // But if paginated, might miss it. Try getByEmail if list is huge? 
                // listUsers defaults to 50 per page.
                console.error('Could not find existing user in first 50 users. Please ensure the user exists.');
                process.exit(1);
            }
            userId = existingUser.id;
            console.log(`Found existing user ID: ${userId}`);
        } else {
            console.error('Error creating user:', createError.message);
            process.exit(1);
        }
    } else if (user) {
        userId = user.id;
        console.log(`User created successfully. ID: ${userId}`);
    } else {
        console.error('Unexpected state: No user returned and no error.');
        process.exit(1);
    }

    // 2. Promote to Admin
    console.log('Promoting user to admin...');

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (updateError) {
        console.error('Error updating profile role:', updateError.message);
        process.exit(1);
    }

    console.log(`✅ Success! User ${email} is now an admin.`);
}

createAdminUser();
