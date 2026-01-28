
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

if (!supabaseUrl || !serviceRoleKey || !adminEmail) {
    console.error('Missing environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAdmin() {
    console.log(`Checking for admin user: ${adminEmail}`);
    console.log(`Connecting to: ${supabaseUrl}`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error listing users:', error);
        return;
    }

    const adminUser = users.find(u => u.email === adminEmail);

    if (adminUser) {
        console.log('✅ Admin user found:');
        console.log(`- ID: ${adminUser.id}`);
        console.log(`- Email: ${adminUser.email}`);
        console.log(`- Role (built-in): ${adminUser.role}`);
        console.log(`- Metadata:`, adminUser.user_metadata);

        if (adminUser.user_metadata?.role === 'admin') {
            console.log('✅ Metadata role is set to "admin".');
        } else {
            console.log('⚠️ Metadata role IS NOT "admin". It is:', adminUser.user_metadata?.role);
        }
    } else {
        console.log('❌ Admin user NOT found.');
        console.log('Existing users:', users.map(u => u.email));
    }
}

checkAdmin();
