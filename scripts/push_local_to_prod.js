// Push LOCAL data to PRODUCTION (replaces prod data!)
// Run with: node scripts/push_local_to_prod.js
// ⚠️ WARNING: This will DELETE all production data and replace it with local data!

const { createClient } = require('@supabase/supabase-js')

const PROD_URL = 'https://bilzgtrlklvtwewwpwjv.supabase.co'
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHpndHJsa2x2dHdld3dwd2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkwOTc5NywiZXhwIjoyMDg0NDg1Nzk3fQ.1OCoeYvgVbRhtrQTSTdTCCqu7I-xcIwrqralbPjJrmo'

const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Tables to sync in dependency order (delete in reverse, insert in order)
const TABLES_TO_SYNC = [
    'services',
    'system_settings',
    'profiles',
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

async function deleteTableData(tableName) {
    console.log(`   🗑️  Deleting ${tableName} from production...`)
    
    const { error } = await prodSupabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (error && !error.message.includes('does not exist')) {
        console.warn(`   ⚠️  Warning deleting ${tableName}:`, error.message)
    }
}

async function pushTable(tableName) {
    console.log(`\n📤 Pushing ${tableName} to production...`)
    
    // Fetch all data from local
    const { data: localData, error: fetchError } = await localSupabase
        .from(tableName)
        .select('*')
    
    if (fetchError) {
        console.error(`   ❌ Error fetching local ${tableName}:`, fetchError.message)
        return
    }
    
    if (!localData || localData.length === 0) {
        console.log(`   ⚠️  No data in local ${tableName}`)
        return
    }
    
    console.log(`   Found ${localData.length} rows in local`)
    
    // Insert local data to production in batches
    const batchSize = 50
    let insertedCount = 0
    
    for (let i = 0; i < localData.length; i += batchSize) {
        const batch = localData.slice(i, i + batchSize)
        const { error: insertError } = await prodSupabase
            .from(tableName)
            .insert(batch)
        
        if (insertError) {
            console.error(`   ❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, insertError.message)
            // Try one by one to identify problematic rows
            for (const row of batch) {
                const { error: singleError } = await prodSupabase
                    .from(tableName)
                    .insert(row)
                if (singleError) {
                    console.error(`      Failed row ID ${row.id}:`, singleError.message)
                } else {
                    insertedCount++
                }
            }
        } else {
            insertedCount += batch.length
            console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} rows)`)
        }
    }
    
    console.log(`   ✅ ${tableName}: ${insertedCount}/${localData.length} rows pushed`)
}

async function pushLocalToProduction() {
    console.log('⚠️  WARNING: This will REPLACE all production data with local data!')
    console.log('⚠️  Make sure you have a backup of production data if needed.\n')
    console.log('Starting in 3 seconds...\n')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('🔄 Pushing LOCAL data to PRODUCTION...\n')
    
    try {
        // First, delete all data from production in REVERSE order (to respect FK constraints)
        console.log('📦 Step 1: Clearing production tables...')
        const reversedTables = [...TABLES_TO_SYNC].reverse()
        for (const table of reversedTables) {
            await deleteTableData(table)
        }
        
        // Then, push local data in order
        console.log('\n📦 Step 2: Pushing local data to production...')
        for (const table of TABLES_TO_SYNC) {
            await pushTable(table)
        }
        
        console.log('\n\n✅ LOCAL → PRODUCTION sync complete!')
        console.log('   All local data has been pushed to production.')
    } catch (error) {
        console.error('\n❌ Sync failed:', error.message)
        console.error(error.stack)
        process.exit(1)
    }
}

pushLocalToProduction()
