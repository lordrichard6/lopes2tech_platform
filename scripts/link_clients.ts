
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function linkClients() {
    console.log('Fetching users and clients...');

    // 1. Fetch all Auth Users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
        console.error('Error fetching users:', usersError);
        return;
    }
    console.log(`Found ${users.length} auth users.`);

    // 2. Fetch all Clients
    const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*');

    if (clientsError) {
        console.error('Error fetching clients:', clientsError);
        return;
    }
    console.log(`Found ${clients.length} clients.`);

    let updatedCount = 0;

    // 3. Match and Update
    for (const client of clients) {
        if (client.user_id) {
            console.log(`Client ${client.name} already linked.`);
            continue;
        }

        if (!client.contact_email) {
            console.log(`Client ${client.name} has no contact email.`);
            continue;
        }

        // Find matching user
        const matchingUser = users.find(u => u.email?.toLowerCase() === client.contact_email.toLowerCase());

        if (matchingUser) {
            console.log(`Found match for ${client.name} (${client.contact_email}) -> User ID: ${matchingUser.id}`);

            const { error: updateError } = await supabase
                .from('clients')
                .update({ user_id: matchingUser.id })
                .eq('id', client.id);

            if (updateError) {
                console.error(`Failed to update client ${client.name}:`, updateError);
            } else {
                console.log(`Successfully linked ${client.name} to user.`);
                updatedCount++;
            }
        } else {
            console.log(`No matching user found for ${client.name} (${client.contact_email})`);
        }
    }

    console.log(`Done. Linked ${updatedCount} clients.`);
}

linkClients();
