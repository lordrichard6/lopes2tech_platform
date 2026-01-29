// Fix production client statuses
// Run with: node scripts/fix_prod_client_statuses.js

const { createClient } = require('@supabase/supabase-js')

const PROD_URL = 'https://bilzgtrlklvtwewwpwjv.supabase.co'
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpbHpndHJsa2x2dHdld3dwd2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkwOTc5NywiZXhwIjoyMDg0NDg1Nzk3fQ.1OCoeYvgVbRhtrQTSTdTCCqu7I-xcIwrqralbPjJrmo'

const supabase = createClient(PROD_URL, PROD_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function fixClientStatuses() {
    console.log('🔧 Fixing production client statuses...\n')

    // First, check current statuses
    const { data: clients, error: fetchError } = await supabase
        .from('clients')
        .select('id, name, status')

    if (fetchError) {
        console.error('❌ Error fetching clients:', fetchError.message)
        process.exit(1)
    }

    console.log(`Found ${clients.length} clients\n`)

    // Show current status distribution
    const statusCounts = {}
    clients.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
    })
    console.log('Current status distribution:')
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`)
    })
    console.log()

    // Old statuses that need to be mapped
    const oldStatuses = ['pre-approval', 'in-development', 'completed', 'maintenance']
    const clientsToUpdate = clients.filter(c => oldStatuses.includes(c.status))

    if (clientsToUpdate.length === 0) {
        console.log('✅ No clients with old statuses found. All statuses are up to date!')
        return
    }

    console.log(`Found ${clientsToUpdate.length} clients with old statuses:\n`)
    clientsToUpdate.forEach(c => {
        console.log(`  - ${c.name}: ${c.status}`)
    })
    console.log()

    // Update statuses
    console.log('Updating statuses...\n')

    // Map pre-approval -> proposal
    const { data: proposalUpdates, error: proposalError } = await supabase
        .from('clients')
        .update({ status: 'proposal' })
        .eq('status', 'pre-approval')
        .select('id, name')

    if (proposalError) {
        console.error('❌ Error updating pre-approval:', proposalError.message)
    } else {
        console.log(`✅ Updated ${proposalUpdates?.length || 0} clients: pre-approval -> proposal`)
        proposalUpdates?.forEach(c => console.log(`   - ${c.name}`))
    }

    // Map in-development, completed, maintenance -> client
    const { data: clientUpdates, error: clientError } = await supabase
        .from('clients')
        .update({ status: 'client' })
        .in('status', ['in-development', 'completed', 'maintenance'])
        .select('id, name, status')

    if (clientError) {
        console.error('❌ Error updating to client:', clientError.message)
    } else {
        console.log(`✅ Updated ${clientUpdates?.length || 0} clients: in-development/completed/maintenance -> client`)
        clientUpdates?.forEach(c => console.log(`   - ${c.name} (was: ${c.status})`))
    }

    // Check for any invalid statuses
    const validStatuses = ['lead', 'qualified', 'proposal', 'client', 'vip', 'inactive', 'churned']
    const { data: allClients, error: finalCheckError } = await supabase
        .from('clients')
        .select('id, name, status')

    if (finalCheckError) {
        console.error('❌ Error checking final status:', finalCheckError.message)
        return
    }

    const invalidClients = allClients.filter(c => !validStatuses.includes(c.status))
    if (invalidClients.length > 0) {
        console.log(`\n⚠️  Found ${invalidClients.length} clients with invalid statuses:`)
        invalidClients.forEach(c => {
            console.log(`  - ${c.name}: ${c.status}`)
        })
        console.log('\nSetting invalid statuses to "lead"...')

        for (const client of invalidClients) {
            const { error: fixError } = await supabase
                .from('clients')
                .update({ status: 'lead' })
                .eq('id', client.id)

            if (fixError) {
                console.error(`   ❌ Failed to fix ${client.name}:`, fixError.message)
            } else {
                console.log(`   ✅ Fixed ${client.name}: ${client.status} -> lead`)
            }
        }
    }

    console.log('\n✅ Client status update complete!')
}

fixClientStatuses().catch(error => {
    console.error('\n❌ Script failed:', error.message)
    console.error(error.stack)
    process.exit(1)
})
