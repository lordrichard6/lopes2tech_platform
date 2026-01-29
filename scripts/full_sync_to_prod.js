// Full sync from LOCAL to PRODUCTION with auth user creation
// Run with: node scripts/full_sync_to_prod.js
// This creates matching auth users in production and syncs all data

const { createClient } = require('@supabase/supabase-js')

const PROD_URL = 'https://bilzgtrlklvtwewwpwjv.supabase.co'
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHpndHJsa2x2dHdld3dwd2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkwOTc5NywiZXhwIjoyMDg0NDg1Nzk3fQ.1OCoeYvgVbRhtrQTSTdTCCqu7I-xcIwrqralbPjJrmo'

const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Your admin email - this user should already exist in production
const ADMIN_EMAIL = 'paulo@lopes2tech.ch'

// Tables to sync (in dependency order)
const TABLES_TO_SYNC = [
    'services',
    'system_settings',
    'clients',
    'projects',
    'milestones',
    'tasks',
    'invoices',
    'invoice_items',
    'invoice_payment_schedules',
    'invoice_payments',
    'documents',
    'subscriptions',
    'project_services',
    'project_links',
    'credentials',
    'notes',
    'activity_logs',
    'notifications',
    'tickets',
]

const prodSupabase = createClient(PROD_URL, PROD_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

const localSupabase = createClient(LOCAL_URL, LOCAL_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

// ID mappings
let userIdMapping = {}      // local user_id -> prod user_id
let clientIdMapping = {}    // local client_id -> prod client_id
let projectIdMapping = {}   // local project_id -> prod project_id
let invoiceIdMapping = {}   // local invoice_id -> prod invoice_id
let serviceIdMapping = {}   // local service_id -> prod service_id

async function syncAuthUsers() {
    console.log('\n👤 Step 1: Syncing auth users...\n')
    
    // Get local users
    const { data: { users: localUsers }, error: localError } = await localSupabase.auth.admin.listUsers()
    if (localError) {
        console.error('❌ Error fetching local users:', localError.message)
        return false
    }
    
    console.log(`   Found ${localUsers.length} local users`)
    
    // Get production users
    const { data: { users: prodUsers }, error: prodError } = await prodSupabase.auth.admin.listUsers()
    if (prodError) {
        console.error('❌ Error fetching prod users:', prodError.message)
        return false
    }
    
    console.log(`   Found ${prodUsers.length} production users`)
    
    // Create mapping and create missing users
    for (const localUser of localUsers) {
        const email = localUser.email?.toLowerCase()
        if (!email) continue
        
        // Find matching prod user by email
        const existingProdUser = prodUsers.find(u => u.email?.toLowerCase() === email)
        
        if (existingProdUser) {
            userIdMapping[localUser.id] = existingProdUser.id
            console.log(`   ✅ Mapped: ${email} (${localUser.id.slice(0,8)}... -> ${existingProdUser.id.slice(0,8)}...)`)
        } else {
            // Create user in production
            console.log(`   🔨 Creating user: ${email}...`)
            const { data: newUser, error: createError } = await prodSupabase.auth.admin.createUser({
                email: email,
                email_confirm: true,
                password: 'TempPassword123!', // They'll need to reset
                user_metadata: localUser.user_metadata
            })
            
            if (createError) {
                console.error(`   ❌ Failed to create ${email}:`, createError.message)
            } else {
                userIdMapping[localUser.id] = newUser.user.id
                console.log(`   ✅ Created: ${email} (${localUser.id.slice(0,8)}... -> ${newUser.user.id.slice(0,8)}...)`)
            }
        }
    }
    
    console.log(`\n   📋 User ID mapping: ${Object.keys(userIdMapping).length} users`)
    return true
}

async function syncProfiles() {
    console.log('\n👤 Step 2: Syncing profiles...\n')
    
    // Get local profiles
    const { data: localProfiles, error } = await localSupabase.from('profiles').select('*')
    if (error) {
        console.error('❌ Error fetching local profiles:', error.message)
        return
    }
    
    console.log(`   Found ${localProfiles.length} local profiles`)
    
    // Delete existing profiles in prod (except unmapped ones)
    const mappedProdIds = Object.values(userIdMapping)
    if (mappedProdIds.length > 0) {
        await prodSupabase.from('profiles').delete().in('id', mappedProdIds)
    }
    
    // Insert profiles with mapped IDs
    for (const profile of localProfiles) {
        const prodUserId = userIdMapping[profile.id]
        if (!prodUserId) {
            console.log(`   ⏭️  Skipping profile ${profile.id} (no user mapping)`)
            continue
        }
        
        const mappedProfile = { ...profile, id: prodUserId }
        
        const { error: insertError } = await prodSupabase
            .from('profiles')
            .upsert(mappedProfile, { onConflict: 'id' })
        
        if (insertError) {
            console.error(`   ❌ Failed profile ${prodUserId}:`, insertError.message)
        } else {
            console.log(`   ✅ Profile synced: ${profile.full_name || profile.id}`)
        }
    }
}

async function deleteTableData(tableName) {
    const { error } = await prodSupabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (error && !error.message.includes('does not exist')) {
        console.warn(`   ⚠️  Warning deleting ${tableName}:`, error.message)
    }
}

function mapForeignKeys(row, tableName) {
    const mapped = { ...row }
    
    // Map user/profile IDs
    if (mapped.user_id && userIdMapping[mapped.user_id]) {
        mapped.user_id = userIdMapping[mapped.user_id]
    }
    if (mapped.profile_id && userIdMapping[mapped.profile_id]) {
        mapped.profile_id = userIdMapping[mapped.profile_id]
    }
    if (mapped.requester_id && userIdMapping[mapped.requester_id]) {
        mapped.requester_id = userIdMapping[mapped.requester_id]
    }
    if (mapped.updated_by && userIdMapping[mapped.updated_by]) {
        mapped.updated_by = userIdMapping[mapped.updated_by]
    }
    
    // Map client IDs
    if (mapped.client_id && clientIdMapping[mapped.client_id]) {
        mapped.client_id = clientIdMapping[mapped.client_id]
    }
    
    // Map project IDs
    if (mapped.project_id && projectIdMapping[mapped.project_id]) {
        mapped.project_id = projectIdMapping[mapped.project_id]
    }
    
    // Map invoice IDs
    if (mapped.invoice_id && invoiceIdMapping[mapped.invoice_id]) {
        mapped.invoice_id = invoiceIdMapping[mapped.invoice_id]
    }
    
    // Map service IDs
    if (mapped.service_id && serviceIdMapping[mapped.service_id]) {
        mapped.service_id = serviceIdMapping[mapped.service_id]
    }
    
    return mapped
}

async function pushTable(tableName) {
    console.log(`\n📤 Pushing ${tableName}...`)
    
    // Fetch local data
    const { data: localData, error: fetchError } = await localSupabase
        .from(tableName)
        .select('*')
    
    if (fetchError) {
        console.error(`   ❌ Error fetching ${tableName}:`, fetchError.message)
        return
    }
    
    if (!localData || localData.length === 0) {
        console.log(`   ⚠️  No data in local ${tableName}`)
        return
    }
    
    console.log(`   Found ${localData.length} rows`)
    
    // Delete existing prod data
    await deleteTableData(tableName)
    
    // Map foreign keys and insert
    let successCount = 0
    const idMapping = {}
    
    for (const row of localData) {
        const originalId = row.id
        const mappedRow = mapForeignKeys(row, tableName)
        
        // Skip if required FK is missing
        if (tableName === 'clients' && mappedRow.profile_id && !userIdMapping[row.profile_id]) {
            // Allow clients without profile_id mapping (some might not have profiles)
            if (row.profile_id) {
                console.log(`   ⏭️  Skipping client ${row.name} (profile not mapped)`)
                continue
            }
        }
        
        const { data: inserted, error: insertError } = await prodSupabase
            .from(tableName)
            .insert(mappedRow)
            .select('id')
            .single()
        
        if (insertError) {
            console.error(`   ❌ Failed: ${insertError.message}`)
        } else {
            successCount++
            if (inserted) {
                idMapping[originalId] = inserted.id
            }
        }
    }
    
    // Update global mappings
    if (tableName === 'clients') Object.assign(clientIdMapping, idMapping)
    if (tableName === 'projects') Object.assign(projectIdMapping, idMapping)
    if (tableName === 'invoices') Object.assign(invoiceIdMapping, idMapping)
    if (tableName === 'services') Object.assign(serviceIdMapping, idMapping)
    
    console.log(`   ✅ ${tableName}: ${successCount}/${localData.length} rows pushed`)
}

async function fullSync() {
    console.log('═══════════════════════════════════════════════════════')
    console.log('   FULL SYNC: LOCAL → PRODUCTION')
    console.log('═══════════════════════════════════════════════════════')
    console.log('⚠️  This will REPLACE all production data with local data')
    console.log('⚠️  Admin email:', ADMIN_EMAIL)
    console.log('\nStarting in 3 seconds...\n')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    try {
        // Step 1: Sync auth users
        const usersOk = await syncAuthUsers()
        if (!usersOk) {
            console.error('\n❌ Auth user sync failed. Aborting.')
            process.exit(1)
        }
        
        // Step 2: Sync profiles
        await syncProfiles()
        
        // Step 3: Clear and sync each table
        console.log('\n📦 Step 3: Syncing data tables...')
        
        // First pass: tables without FK dependencies
        await pushTable('services')
        await pushTable('system_settings')
        
        // Second pass: clients (depends on profiles)
        await pushTable('clients')
        
        // Third pass: projects (depends on clients)
        await pushTable('projects')
        
        // Fourth pass: everything else
        await pushTable('milestones')
        await pushTable('tasks')
        await pushTable('invoices')
        await pushTable('invoice_items')
        await pushTable('invoice_payment_schedules')
        await pushTable('invoice_payments')
        await pushTable('documents')
        await pushTable('subscriptions')
        await pushTable('project_services')
        await pushTable('project_links')
        await pushTable('credentials')
        await pushTable('notes')
        await pushTable('activity_logs')
        await pushTable('notifications')
        await pushTable('tickets')
        
        console.log('\n═══════════════════════════════════════════════════════')
        console.log('   ✅ FULL SYNC COMPLETE!')
        console.log('═══════════════════════════════════════════════════════')
        console.log('\n📋 Summary:')
        console.log(`   Users mapped: ${Object.keys(userIdMapping).length}`)
        console.log(`   Clients mapped: ${Object.keys(clientIdMapping).length}`)
        console.log(`   Projects mapped: ${Object.keys(projectIdMapping).length}`)
        console.log(`   Invoices mapped: ${Object.keys(invoiceIdMapping).length}`)
        console.log('\n⚠️  New users created with password: TempPassword123!')
        console.log('   They should reset their passwords.')
        
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message)
        console.error(error.stack)
        process.exit(1)
    }
}

fullSync()
