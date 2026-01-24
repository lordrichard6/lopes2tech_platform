
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

// Mop from SQL query
const authUsers = [
    { "id": "00000000-0000-0000-0000-000000000002", "email": "employee@lopes2tech.ch" },
    { "id": "00000000-0000-0000-0000-000000000003", "email": "client@gmail.com" },
    { "id": "e404423d-c545-4651-8f32-8b035b2d9e9b", "email": "hugo@cansadogarage.com" },
    { "id": "ffa03253-a09f-4404-bbd4-e5a230aa2907", "email": "admin@lopes2tech.ch" },
    { "id": "32ebb2ef-1181-44be-b098-befd5c289b98", "email": "seguros.ritareis@gmail.com" },
    { "id": "ab3d0e50-ac4e-4bd1-9ed3-444c109f3579", "email": "info@maelysluis.com" },
    { "id": "e70db334-68ca-44ac-8dc4-7c063632a4cc", "email": "mampiriquitohause@hotmail.com" },
    { "id": "afa888cb-1678-4690-aaa8-7d0a4d075955", "email": "info@beautyhairtwins.com" },
    { "id": "20d8ae97-51ba-4bfd-91ac-a3b4a6fc9acd", "email": "marta@fonseca-therapy.com" }
]

const clientDetails = [
    { email: 'seguros.ritareis@gmail.com', fullName: 'Rita Reis', status: 'in-development' },
    { email: 'mampiriquitohause@hotmail.com', fullName: 'Ribeiro Consulting', status: 'maintenance' },
    { email: 'info@beautyhairtwins.com', fullName: 'Beauty Hair Twins', status: 'in-development' },
    { email: 'hugo@cansadogarage.com', fullName: 'Hugo Sousa', status: 'lead' },
    { email: 'info@maelysluis.com', fullName: 'Rita & Jéssica Soares', status: 'in-development' },
    { email: 'marta@fonseca-therapy.com', fullName: 'Marta Fonseca', status: 'lead' },
]

async function restoreClients() {
    console.log('Restoring client records based on Auth IDs...')

    for (const detail of clientDetails) {
        const authUser = authUsers.find(u => u.email === detail.email)

        if (!authUser) {
            console.error(`Auth user not found for ${detail.email}`)
            continue
        }

        console.log(`Processing ${detail.fullName} (Auth ID: ${authUser.id})`)

        // 1. Ensure Profile Role
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'client' })
            .eq('id', authUser.id)

        if (profileError) console.error(`   Profile update error:`, profileError.message)

        // 2. Upsert Client Record (Sync by profile_id)
        // Check if exists first
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('profile_id', authUser.id)
            .single()

        if (existingClient) {
            const { error: updateError } = await supabase
                .from('clients')
                .update({
                    contact_email: detail.email,
                    name: detail.fullName,
                    status: detail.status
                })
                .eq('id', existingClient.id)

            if (updateError) console.error(`   Update error:`, updateError.message)
            else console.log(`   ✅ Synced existing client.`)

        } else {
            // Try to find orphaned record by email
            const { data: orphaned } = await supabase
                .from('clients')
                .select('id')
                .eq('contact_email', detail.email)
                .single()

            if (orphaned) {
                console.log(`   Found orphaned record. Linking...`)
                const { error: linkError } = await supabase
                    .from('clients')
                    .update({
                        profile_id: authUser.id,
                        name: detail.fullName,
                        status: detail.status
                    })
                    .eq('id', orphaned.id)

                if (linkError) console.error(`   Link error:`, linkError.message)
                else console.log(`   ✅ Re-linked orphaned client.`)
            } else {
                console.log(`   No record found. Inserting fresh...`)
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert({
                        profile_id: authUser.id,
                        contact_email: detail.email,
                        name: detail.fullName,
                        status: detail.status
                    })

                if (insertError) console.error(`   Insert error:`, insertError.message)
                else console.log(`   ✅ Inserted new client.`)
            }
        }
    }
}

restoreClients()
