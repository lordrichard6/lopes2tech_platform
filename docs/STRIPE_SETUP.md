# Stripe Subscription Setup Guide

## Environment Configuration

### Development (Local)
Uses **test/sandbox** keys from `.env.local`:

```env
# Stripe Configuration (Development - Test/Sandbox Mode)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production (Vercel)
Uses **live** keys from Vercel Environment Variables:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these variables for **Production** environment:
   - `STRIPE_SECRET_KEY` = `sk_live_...` (your live secret key)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (your live publishable key)
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...` (your production webhook secret)

**Important:** Never commit production keys to git. They should only exist in Vercel environment variables.

---

## How It Works

The code automatically uses the correct key based on environment:
- **Local development** → Reads from `.env.local` (test keys)
- **Production** → Reads from Vercel env vars (live keys)

The `src/lib/stripe.ts` file checks `process.env.STRIPE_SECRET_KEY` which Next.js automatically loads from the appropriate source.

---

## Getting Your Stripe Keys

### Test Keys (for development)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy **Secret key** (starts with `sk_test_`)
3. Copy **Publishable key** (starts with `pk_test_`)
4. Add to `.env.local`

### Live Keys (for production)
1. **Switch to Live Mode** in Stripe Dashboard (toggle in top right)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Copy **Secret key** (starts with `sk_live_`)
4. Copy **Publishable key** (starts with `pk_live_`)
5. Add to **Vercel Environment Variables** (not in code!)

---

## Webhook Setup

### Development (Local Testing)
Use Stripe CLI to forward webhooks to localhost:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a webhook secret starting with `whsec_` - add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### Production
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Add endpoint: `https://app.lopes2tech.ch/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed` (optional, for failure handling)
   - `customer.subscription.deleted` (optional, for cancellation sync)
4. Copy the **Signing Secret** (`whsec_...`)
5. Add to **Vercel Environment Variables** as `STRIPE_WEBHOOK_SECRET`

---

## Testing the Setup

### Test Locally
```bash
# Run the sync script to verify connection
node scripts/sync-stripe-products.js
```

This should list all your Stripe products and prices if the connection works.

### Verify Production
After deploying, check that Stripe webhooks are being received:
- Stripe Dashboard → **Developers** → **Webhooks** → Your endpoint
- Check the **Recent events** section

---

## Security Notes

- ✅ **Test keys** (`sk_test_...`) are safe to commit to `.env.local` (they're for testing only)
- ❌ **Live keys** (`sk_live_...`) should NEVER be committed to git
- ✅ Always use Vercel Environment Variables for production secrets
- ✅ Webhook secrets should also be in environment variables, not code
