// Script to fetch Stripe products and prices, then help map them to services
// Run with: node scripts/sync-stripe-products.js
// Requires: STRIPE_SECRET_KEY in .env.local
// Note: Next.js automatically loads .env.local, but for standalone scripts,
// you may need to set the env var directly: STRIPE_SECRET_KEY=sk_test_... node scripts/sync-stripe-products.js

const Stripe = require('stripe')
const fs = require('fs')
const path = require('path')

// Try to load .env.local manually
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
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables')
    console.error('   Please add it to your .env.local file:')
    console.error('   STRIPE_SECRET_KEY=sk_test_...')
    process.exit(1)
}

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
})

async function fetchStripeProducts() {
    console.log('🔍 Fetching Stripe products and prices...\n')

    try {
        // Fetch all products
        const products = await stripe.products.list({ limit: 100, active: true })
        
        if (products.data.length === 0) {
            console.log('⚠️  No active products found in Stripe')
            return []
        }

        console.log(`✅ Found ${products.data.length} active product(s)\n`)

        // Fetch prices for each product
        const productsWithPrices = []

        for (const product of products.data) {
            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
                limit: 100
            })

            productsWithPrices.push({
                product,
                prices: prices.data
            })
        }

        return productsWithPrices
    } catch (error) {
        console.error('❌ Error fetching from Stripe:', error.message)
        if (error.type === 'StripeAuthenticationError') {
            console.error('   ⚠️  Check that your STRIPE_SECRET_KEY is correct')
        }
        process.exit(1)
    }
}

async function displayProducts(productsWithPrices) {
    console.log('📦 STRIPE PRODUCTS & PRICES\n')
    console.log('═'.repeat(80))

    for (const { product, prices } of productsWithPrices) {
        console.log(`\n📦 Product: ${product.name}`)
        console.log(`   Product ID: ${product.id}`)
        if (product.description) {
            console.log(`   Description: ${product.description}`)
        }

        if (prices.length === 0) {
            console.log(`   ⚠️  No active prices found`)
            continue
        }

        console.log(`\n   💰 Prices:`)
        for (const price of prices) {
            const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A'
            const currency = price.currency.toUpperCase()
            const interval = price.recurring?.interval || 'one-time'
            const intervalCount = price.recurring?.interval_count || 1
            
            let intervalText = ''
            if (price.recurring) {
                if (intervalCount === 1) {
                    intervalText = `/${interval}`
                } else {
                    intervalText = `/${intervalCount} ${interval}s`
                }
            } else {
                intervalText = ' (one-time)'
            }

            console.log(`      • ${currency} ${amount}${intervalText}`)
            console.log(`        Price ID: ${price.id}`)
            if (price.nickname) {
                console.log(`        Nickname: ${price.nickname}`)
            }
        }
    }

    console.log('\n' + '═'.repeat(80))
}

async function generateMappingSuggestions(productsWithPrices) {
    console.log('\n💡 MAPPING SUGGESTIONS\n')
    console.log('Copy these Price IDs into your Services:\n')

    for (const { product, prices } of productsWithPrices) {
        // Find recurring prices (subscriptions)
        const recurringPrices = prices.filter(p => p.recurring)
        
        if (recurringPrices.length > 0) {
            console.log(`📦 ${product.name}:`)
            for (const price of recurringPrices) {
                const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A'
                const currency = price.currency.toUpperCase()
                const interval = price.recurring?.interval || 'month'
                
                console.log(`   → Service: "${product.name}" (${currency} ${amount}/${interval})`)
                console.log(`     Stripe Product ID: ${product.id}`)
                console.log(`     Stripe Price ID: ${price.id}`)
                console.log('')
            }
        }
    }
}

async function main() {
    const productsWithPrices = await fetchStripeProducts()
    
    if (productsWithPrices.length === 0) {
        return
    }

    await displayProducts(productsWithPrices)
    await generateMappingSuggestions(productsWithPrices)

    console.log('\n✅ Done! Use the Price IDs above to update your Services in the platform.')
    console.log('   Go to: /admin/services → Edit Service → Paste Price ID')
}

main().catch(console.error)
