// Script to link "Hosting: Monthly" service to Stripe Price ID
// Run with: node scripts/link-hosting-service.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load .env.local
function loadEnvLocal() {
    const envPath = path.join(__dirname, '..', '.env.local')
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8')
        content.split('\n').forEach(line => {
            const match = line.match(/^([^#=]+)=(.*)$/)
            if (match) {
                const key = match[1].trim()
                const value = match[2].trim().replace(/^["']|["']$/g, '')
                if (!process.env[key]) {
                    process.env[key] = value
                }
            }
        })
    }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

const supabase = createClient(supabaseUrl, supabaseKey)

// Stripe Product and Price IDs from your Stripe account
const STRIPE_PRODUCT_ID = 'prod_TsMYD237LZTVoV' // Host basic pack
const STRIPE_PRICE_ID = 'price_1SuboyGisvlguHA4mJaYHA7K' // CHF 39/month

async function linkHostingService() {
    console.log('🔗 Linking Hosting service to Stripe...\n')

    try {
        // Find the "Hosting: Monthly" service
        const { data: services, error: fetchError } = await supabase
            .from('services')
            .select('*')
            .eq('name', 'Hosting: Monthly')
            .limit(1)

        if (fetchError) {
            console.error('❌ Error fetching service:', fetchError.message)
            process.exit(1)
        }

        if (!services || services.length === 0) {
            console.error('❌ Service "Hosting: Monthly" not found')
            console.log('\nAvailable hosting services:')
            const { data: allHosting } = await supabase
                .from('services')
                .select('id, name, price, billing_type')
                .ilike('name', '%Hosting%')
            
            allHosting?.forEach(s => {
                console.log(`   • ${s.name} (${s.price} CHF/${s.billing_type})`)
            })
            process.exit(1)
        }

        const service = services[0]
        console.log(`✅ Found service: "${service.name}"`)
        console.log(`   Current price: CHF ${service.price}/${service.billing_type}`)
        console.log(`   Current Stripe Product ID: ${service.stripe_product_id || 'None'}`)
        console.log(`   Current Stripe Price ID: ${service.stripe_price_id || 'None'}`)

        // Update with Stripe IDs
        const { error: updateError } = await supabase
            .from('services')
            .update({
                stripe_product_id: STRIPE_PRODUCT_ID,
                stripe_price_id: STRIPE_PRICE_ID,
                // Optionally update price to match Stripe (CHF 39)
                price: 39
            })
            .eq('id', service.id)

        if (updateError) {
            console.error('❌ Error updating service:', updateError.message)
            process.exit(1)
        }

        console.log('\n✅ Service updated successfully!')
        console.log(`   Stripe Product ID: ${STRIPE_PRODUCT_ID}`)
        console.log(`   Stripe Price ID: ${STRIPE_PRICE_ID}`)
        console.log(`   Price updated to: CHF 39/month`)
        console.log('\n💡 You can now use "Link Payment" button for subscriptions!')

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

linkHostingService()
