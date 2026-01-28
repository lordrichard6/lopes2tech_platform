// Sync production data to local (excluding auth schema to preserve working auth)
// Run with: npx tsx scripts/sync_prod_data.ts

import { createClient } from '@supabase/supabase-js'

const PROD_URL = 'https://bilzgtrlklvtwewwpwjv.supabase.co'
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHpndHJsa2x2dHdld3dwd2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkwOTc5NywiZXhwIjoyMDg0NDg1Nzk3fQ.1OCoeYvgVbRhtrQTSTdTCCqu7I-xcIwrqralbPjJrmo'

const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

// Tables to sync (excluding auth.* and system tables)
// Order matters: sync in dependency order (dependencies first)
const TABLES_TO_SYNC = [
    'services',           // No dependencies
    'system_settings',    // No dependencies
    'clients',            // Depends on profiles (but we'll handle profiles separately)
    'projects',           // Depends on clients
    'milestones',         // Depends on projects
    'tasks',              // Depends on projects
    'invoices',           // Depends on clients, projects
    'invoice_payment_schedules', // Depends on invoices
    'documents',          // Depends on clients, projects
    'subscriptions',      // Depends on clients, services
    'project_services',   // Depends on projects, services
    'credentials',        // Depends on clients
    'notes',              // Depends on clients, projects
    'activity_logs',      // Depends on profiles
    'notifications',      // Depends on profiles
    'tickets',            // No dependencies
]

const prodSupabase = createClient(PROD_URL, PROD_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const localSupabase = createClient(LOCAL_URL, LOCAL_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function syncTable(tableName: string) {
    console.log(`\n📥 Syncing ${tableName}...`)
    
    // Fetch all data from production
    const { data: prodData, error: fetchError } = await prodSupabase
        .from(tableName)
        .select('*')
    
    if (fetchError) {
        console.error(`   ❌ Error fetching ${tableName}:`, fetchError.message)
        return
    }
    
    if (!prodData || prodData.length === 0) {
        console.log(`   ⚠️  No data in production ${tableName}`)
        return
    }
    
    console.log(`   Found ${prodData.length} rows in production`)
    
    // Delete all local data from this table
    const { error: deleteError } = await localSupabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (this condition always true)
    
    if (deleteError && !deleteError.message.includes('does not exist')) {
        console.warn(`   ⚠️  Warning deleting local ${tableName}:`, deleteError.message)
    }
    
    // Insert production data in batches
    const batchSize = 100
    for (let i = 0; i < prodData.length; i += batchSize) {
        const batch = prodData.slice(i, i + batchSize)
        const { error: insertError } = await localSupabase
            .from(tableName)
            .insert(batch)
        
        if (insertError) {
            console.error(`   ❌ Error inserting batch ${i / batchSize + 1} of ${tableName}:`, insertError.message)
            // Continue with next batch
        } else {
            console.log(`   ✅ Inserted batch ${i / batchSize + 1} (${batch.length} rows)`)
        }
    }
    
    console.log(`   ✅ ${tableName} synced`)
}

async function syncProfiles() {
    console.log('\n📥 Syncing profiles (with auth user linking)...')
    
    // Get production profiles
    const { data: prodProfiles, error: fetchError } = await prodSupabase
        .from('profiles')
        .select('*')
    
    if (fetchError) {
        console.error('   ❌ Error fetching profiles:', fetchError.message)
        return
    }
    
    if (!prodProfiles || prodProfiles.length === 0) {
        console.log('   ⚠️  No profiles in production')
        return
    }
    
    console.log(`   Found ${prodProfiles.length} profiles in production`)
    
    // Get local auth users
    const { data: { users: localUsers }, error: usersError } = await localSupabase.auth.admin.listUsers()
    
    if (usersError) {
        console.error('   ❌ Error fetching local users:', usersError.message)
        return
    }
    
    // Sync profiles, linking to local auth users by email
    for (const prodProfile of prodProfiles) {
        const matchingLocalUser = localUsers?.find(u => 
            u.email?.toLowerCase() === prodProfile.email?.toLowerCase()
        )
        
        if (matchingLocalUser) {
            // Update existing profile or insert with local user ID
            const profileData = {
                ...prodProfile,
                id: matchingLocalUser.id, // Use local auth user ID
                email: matchingLocalUser.email
            }
            
            const { error: upsertError } = await localSupabase
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' })
            
            if (upsertError) {
                console.warn(`   ⚠️  Could not sync profile for ${prodProfile.email}:`, upsertError.message)
            } else {
                console.log(`   ✅ Synced profile for ${prodProfile.email}`)
            }
        } else {
            // Profile exists in prod but no matching local auth user
            // Skip it - we only sync profiles for users that exist locally
            console.log(`   ⏭️  Skipped profile ${prodProfile.email} (no matching local auth user)`)
        }
    }
    
    console.log('   ✅ Profiles synced')
}

async function syncProductionData() {
    console.log('🔄 Syncing production data to local...')
    console.log('   (Preserving local auth users)\n')
    
    try {
        // Sync tables in dependency order
        for (const table of TABLES_TO_SYNC) {
            await syncTable(table)
        }
        
        // Sync profiles last (needs special handling to link to local auth users)
        await syncProfiles()
        
        console.log('\n✅ Production data sync complete!')
        console.log('   Your local auth users are preserved.')
        console.log('   Production data (clients, projects, invoices, etc.) is now synced.')
    } catch (error: any) {
        console.error('\n❌ Sync failed:', error.message)
        console.error(error.stack)
        process.exit(1)
    }
}

syncProductionData()
