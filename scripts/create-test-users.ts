// Script to create test users via Supabase Auth Admin API
// Run with: npx tsx scripts/create-test-users.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz' // Local service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const users = [
    { email: 'admin@lopes2tech.ch', password: 'admin123', role: 'admin', fullName: 'Paulo Lopes' },
    { email: 'employee@lopes2tech.ch', password: 'employee123', role: 'employee', fullName: 'Test Employee' },
    { email: 'seguros.ritareis@gmail.com', password: 'client123', role: 'client', fullName: 'Rita Reis', status: 'in-development' },
    { email: 'mampiriquitohause@hotmail.com', password: 'client123', role: 'client', fullName: 'Ribeiro Consulting', status: 'maintenance' },
    { email: 'info@beautyhairtwins.com', password: 'client123', role: 'client', fullName: 'Beauty Hair Twins', status: 'in-development' },
    { email: 'hugo@cansadogarage.com', password: 'client123', role: 'client', fullName: 'Hugo Sousa', status: 'lead' },
    { email: 'info@maelysluis.com', password: 'client123', role: 'client', fullName: 'Rita & Jéssica Soares', status: 'in-development' },
    { email: 'marta@fonseca-therapy.com', password: 'client123', role: 'client', fullName: 'Marta Fonseca', status: 'lead' },
]

async function createUsers() {
    console.log('Syncing users and client data...\n')

    // List all users to maximize hit rate
    const { data: { users: allUsers }, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (listError) console.error('Error listing users:', listError.message)

    for (const user of users) {
        let userId: string | undefined
        const normalizedEmail = user.email.toLowerCase()

        // 1. Try to find existing user locally from the list
        const existing = allUsers?.find(u => u.email?.toLowerCase() === normalizedEmail)

        if (existing) {
            console.log(`User found: ${user.email}`)
            userId = existing.id
            // Update metadata just in case
            await supabase.auth.admin.updateUserById(existing.id, {
                user_metadata: { full_name: user.fullName, role: user.role }
            })
        } else {
            // 2. Create if not exists
            const { data, error } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: {
                    full_name: user.fullName,
                    role: user.role
                }
            })

            if (error) {
                console.error(`Error creating ${user.email}:`, error.message)
                // If "already registered" hits here but listUsers missed it, we can't do much without an ID.
                continue
            } else {
                console.log(`✅ Created user: ${user.email} (${user.role})`)
                userId = data.user.id
            }
        }

        if (!userId) {
            console.warn(`Skipping ${user.email} - no User ID available.`)
            continue
        }

        // 3. Ensure Profile Role
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: user.role })
            .eq('id', userId)

        if (profileError) console.error(`   Profile error:`, profileError.message)

        // 4. Ensure Client Record exists and is LINKED
        if (user.role === 'client') {
            // First, try to find by profile_id
            let { data: existingClient } = await supabase
                .from('clients')
                .select('id, profile_id')
                .eq('profile_id', userId)
                .maybeSingle()

            // If not found by profile_id, try finding by EMAIL (orphaned check)
            if (!existingClient) {
                const { data: byEmail } = await supabase
                    .from('clients')
                    .select('id, profile_id')
                    .eq('contact_email', user.email)
                    .maybeSingle()

                if (byEmail) {
                    console.log(`   Found orphaned client by email: ${user.email}. Re-linking...`)
                    // Existing client found by email -> Link it to new user!
                    existingClient = byEmail
                }
            }

            if (existingClient) {
                // Update
                const { error: updateError } = await supabase
                    .from('clients')
                    .update({
                        contact_email: user.email,
                        name: user.fullName,
                        profile_id: userId, // Ensure link is correct
                        status: (user as any).status || 'lead'
                    })
                    .eq('id', existingClient.id)

                if (updateError) console.error(`   Client update error:`, updateError.message)
                else console.log(`   ✅ Client record updated/linked: ${user.fullName}`)
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert({
                        profile_id: userId,
                        contact_email: user.email,
                        name: user.fullName,
                        status: (user as any).status || 'lead'
                    })

                if (insertError) console.error(`   Client insert error:`, insertError.message)
                else console.log(`   ✅ Client record created: ${user.fullName}`)
            }
        }
    }

    console.log('\nDone! Data synced.')
}

createUsers()
