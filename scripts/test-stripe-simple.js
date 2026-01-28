// Simple Stripe connection test
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

console.log('✅ Key loaded:', stripeSecretKey.substring(0, 20) + '...')
console.log('🔍 Testing Stripe connection...\n')

const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
})

async function test() {
    try {
        // Simple API call to verify connection
        const account = await stripe.accounts.retrieve()
        console.log('✅ Stripe connection successful!')
        console.log('   Account ID:', account.id)
        console.log('   Country:', account.country)
        console.log('   Type:', account.type)
        
        // Now fetch products
        console.log('\n📦 Fetching products...')
        const products = await stripe.products.list({ limit: 10, active: true })
        console.log(`✅ Found ${products.data.length} active product(s)\n`)
        
        if (products.data.length === 0) {
            console.log('⚠️  No products found. Create a product in Stripe Dashboard first.')
            return
        }
        
        for (const product of products.data) {
            console.log(`\n📦 ${product.name}`)
            console.log(`   Product ID: ${product.id}`)
            
            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
                limit: 10
            })
            
            if (prices.data.length === 0) {
                console.log('   ⚠️  No prices found')
                continue
            }
            
            console.log(`   💰 Prices:`)
            for (const price of prices.data) {
                const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A'
                const currency = price.currency.toUpperCase()
                const interval = price.recurring?.interval || 'one-time'
                
                console.log(`      • ${currency} ${amount}${price.recurring ? `/${interval}` : ' (one-time)'}`)
                console.log(`        Price ID: ${price.id}`)
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.type === 'StripeAuthenticationError') {
            console.error('   ⚠️  Authentication failed. Check your STRIPE_SECRET_KEY')
        } else if (error.type === 'StripeAPIError') {
            console.error('   ⚠️  API Error:', error.message)
        }
        process.exit(1)
    }
}

test()
