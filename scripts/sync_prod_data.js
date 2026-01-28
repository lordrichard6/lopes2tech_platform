// Sync production data to local (excluding auth schema to preserve working auth)
// Run with: node scripts/sync_prod_data.js

const { createClient } = require('@supabase/supabase-js')

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

async function syncTable(tableName, profileIdMapping = {}, clientIdMapping = {}, projectIdMapping = {}) {
    console.log(`\n📥 Syncing ${tableName}...`)
    
    // Fetch all data from production
    const { data: prodData, error: fetchError } = await prodSupabase
        .from(tableName)
        .select('*')
    
    if (fetchError) {
        console.error(`   ❌ Error fetching ${tableName}:`, fetchError.message)
        return {}
    }
    
    if (!prodData || prodData.length === 0) {
        console.log(`   ⚠️  No data in production ${tableName}`)
        return {}
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
    
    // Create ID mapping for this table (production ID -> local ID)
    const idMapping = {}
    
    // Map foreign keys that reference profile_id, user_id, or client_id
    const mappedData = prodData.map((row, index) => {
        const mappedRow = { ...row }
        const originalId = mappedRow.id
        
        // Map profile_id if it exists
        if (mappedRow.profile_id && profileIdMapping[mappedRow.profile_id]) {
            mappedRow.profile_id = profileIdMapping[mappedRow.profile_id]
        }
        
        // Map user_id if it exists (for activity_logs, etc.)
        if (mappedRow.user_id && profileIdMapping[mappedRow.user_id]) {
            mappedRow.user_id = profileIdMapping[mappedRow.user_id]
        }
        
        // Map client_id if it exists (for projects, invoices, etc.)
        if (mappedRow.client_id && clientIdMapping[mappedRow.client_id]) {
            mappedRow.client_id = clientIdMapping[mappedRow.client_id]
        }
        
        // Map project_id if it exists (for milestones, tasks, etc.)
        if (mappedRow.project_id && projectIdMapping[mappedRow.project_id]) {
            mappedRow.project_id = projectIdMapping[mappedRow.project_id]
        }
        
        return mappedRow
    })
    
    // Insert production data in batches
    const batchSize = 100
    for (let i = 0; i < mappedData.length; i += batchSize) {
        const batch = mappedData.slice(i, i + batchSize)
        const { error: insertError } = await localSupabase
            .from(tableName)
            .insert(batch)
        
        if (insertError) {
            console.error(`   ❌ Error inserting batch ${Math.floor(i / batchSize) + 1} of ${tableName}:`, insertError.message)
            // Try inserting one by one to see which row fails
            if (batch.length === 1) {
                console.error(`      Failed row:`, JSON.stringify(batch[0], null, 2))
            }
        } else {
            console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows)`)
            // Build ID mapping for inserted rows
            batch.forEach((row, idx) => {
                const originalRow = prodData[i + idx]
                if (originalRow && row.id) {
                    idMapping[originalRow.id] = row.id
                }
            })
        }
    }
    
    console.log(`   ✅ ${tableName} synced`)
    return idMapping
}

async function syncProfiles() {
    console.log('\n📥 Syncing profiles (with auth user linking)...')
    
    // Get production profiles
    const { data: prodProfiles, error: fetchError } = await prodSupabase
        .from('profiles')
        .select('*')
    
    if (fetchError) {
        console.error('   ❌ Error fetching profiles:', fetchError.message)
        return {}
    }
    
    if (!prodProfiles || prodProfiles.length === 0) {
        console.log('   ⚠️  No profiles in production')
        return {}
    }
    
    console.log(`   Found ${prodProfiles.length} profiles in production`)
    
    // Get production auth users to get emails
    const { data: { users: prodUsers }, error: prodUsersError } = await prodSupabase.auth.admin.listUsers()
    
    if (prodUsersError) {
        console.error('   ⚠️  Could not fetch production users:', prodUsersError.message)
    }
    
    // Get local auth users
    const { data: { users: localUsers }, error: usersError } = await localSupabase.auth.admin.listUsers()
    
    if (usersError) {
        console.error('   ❌ Error fetching local users:', usersError.message)
        return {}
    }
    
    // Create mapping: production profile_id -> local profile_id
    const profileIdMapping = {}
    
    // Sync profiles, linking to local auth users by email
    for (const prodProfile of prodProfiles) {
        // Try to find email from production auth.users
        const prodUser = prodUsers?.find(u => u.id === prodProfile.id)
        const email = prodUser?.email || prodProfile.email
        
        if (!email) {
            console.log(`   ⏭️  Skipped profile ${prodProfile.id} (no email found)`)
            continue
        }
        
        const matchingLocalUser = localUsers?.find(u => 
            u.email?.toLowerCase() === email.toLowerCase()
        )
        
        if (matchingLocalUser) {
            // Map production profile ID to local profile ID
            profileIdMapping[prodProfile.id] = matchingLocalUser.id
            
            // Update existing profile or insert with local user ID (remove email - it's not in profiles table)
            const profileData = { ...prodProfile }
            delete profileData.id
            delete profileData.email // profiles table doesn't have email column
            
            const finalProfileData = {
                id: matchingLocalUser.id,
                ...profileData
            }
            
            const { error: upsertError } = await localSupabase
                .from('profiles')
                .upsert(finalProfileData, { onConflict: 'id' })
            
            if (upsertError) {
                console.warn(`   ⚠️  Could not sync profile for ${email}:`, upsertError.message)
            } else {
                console.log(`   ✅ Synced profile for ${email} (${prodProfile.id} -> ${matchingLocalUser.id})`)
            }
        } else {
            // Profile exists in prod but no matching local auth user
            // Create a local auth user for this profile
            console.log(`   🔨 Creating local auth user for ${email}...`)
            
            const { data: newUser, error: createError } = await localSupabase.auth.admin.createUser({
                email: email,
                email_confirm: true,
                user_metadata: {
                    full_name: prodProfile.full_name || email,
                    role: prodProfile.role || 'client'
                }
            })
            
            if (createError) {
                console.warn(`   ⚠️  Could not create user for ${email}:`, createError.message)
                continue
            }
            
            profileIdMapping[prodProfile.id] = newUser.user.id
            
            // Create profile with local user ID (remove email - it's not in profiles table)
            const profileData = { ...prodProfile }
            delete profileData.id
            delete profileData.email // profiles table doesn't have email column
            
            const finalProfileData = {
                id: newUser.user.id,
                ...profileData
            }
            
            const { error: upsertError } = await localSupabase
                .from('profiles')
                .upsert(finalProfileData, { onConflict: 'id' })
            
            if (upsertError) {
                console.warn(`   ⚠️  Could not sync profile for ${email}:`, upsertError.message)
            } else {
                console.log(`   ✅ Created and synced profile for ${email} (${prodProfile.id} -> ${newUser.user.id})`)
            }
        }
    }
    
    console.log('   ✅ Profiles synced')
    return profileIdMapping
}

async function syncProductionData() {
    console.log('🔄 Syncing production data to local...')
    console.log('   (Preserving local auth users)\n')
    
    try {
        // Sync profiles FIRST to create the profile ID mapping
        const profileIdMapping = await syncProfiles()
        
        // Track ID mappings for tables that other tables depend on
        const clientIdMapping = {}
        const projectIdMapping = {}
        
        // Sync tables in dependency order, passing the ID mappings
        for (const table of TABLES_TO_SYNC) {
            let idMapping = {}
            
            if (table === 'clients') {
                idMapping = await syncTable(table, profileIdMapping, {}, {})
                Object.assign(clientIdMapping, idMapping)
            } else if (table === 'projects') {
                idMapping = await syncTable(table, profileIdMapping, clientIdMapping, {})
                Object.assign(projectIdMapping, idMapping)
            } else if (table === 'milestones' || table === 'tasks' || table === 'project_services') {
                // These depend on projects
                await syncTable(table, profileIdMapping, clientIdMapping, projectIdMapping)
            } else {
                // Other tables
                await syncTable(table, profileIdMapping, clientIdMapping, {})
            }
        }
        
        console.log('\n✅ Production data sync complete!')
        console.log('   Your local auth users are preserved.')
        console.log('   Production data (clients, projects, invoices, etc.) is now synced.')
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message)
        console.error(error.stack)
        process.exit(1)
    }
}

syncProductionData()
