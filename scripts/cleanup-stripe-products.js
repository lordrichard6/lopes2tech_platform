// Script to delete unused Stripe products and prices
// Run with: node scripts/cleanup-stripe-products.js
// WARNING: This will DELETE products from Stripe. Use with caution!

const Stripe = require('stripe')
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

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found')
    process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
})

// Products to KEEP (by Product ID)
const KEEP_PRODUCTS = [
    'prod_TsMYD237LZTVoV', // Host basic pack
]

async function cleanupStripe() {
    console.log('🧹 Cleaning up unused Stripe products...\n')
    console.log('⚠️  Products to KEEP:')
    for (const id of KEEP_PRODUCTS) {
        console.log(`   • ${id}`)
    }
    console.log('')

    try {
        // Fetch all products
        const products = await stripe.products.list({ limit: 100, active: true })
        
        let deletedCount = 0
        let keptCount = 0

        for (const product of products.data) {
            if (KEEP_PRODUCTS.includes(product.id)) {
                console.log(`✅ KEEPING: ${product.name} (${product.id})`)
                keptCount++
                continue
            }

            console.log(`🗑️  DELETING: ${product.name} (${product.id})`)
            
            // Archive the product (Stripe doesn't allow permanent deletion)
            try {
                await stripe.products.update(product.id, {
                    active: false
                })
                console.log(`   ✅ Archived product`)
                deletedCount++
            } catch (error) {
                console.error(`   ❌ Error archiving product:`, error.message)
            }
        }

        console.log(`\n✅ Cleanup complete!`)
        console.log(`   Kept: ${keptCount} product(s)`)
        console.log(`   Archived: ${deletedCount} product(s)`)
        console.log(`\n💡 Note: Products are archived (not deleted) in Stripe.`)
        console.log(`   They won't appear in active listings but can be restored if needed.`)

    } catch (error) {
        console.error('❌ Error:', error.message)
        process.exit(1)
    }
}

cleanupStripe()
