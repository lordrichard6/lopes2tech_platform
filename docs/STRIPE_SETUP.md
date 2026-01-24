# Stripe Subscription Automation Setup

I have fully implemented the automated Stripe Subscription system. Here is how to configure and use it.

## 1. Environment Setup

Ensure you have the following in your `.env`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (or your production URL)
```

## 2. Webhook Configuration

1. Go to your **Stripe Dashboard > Developers > Webhooks**.
2. Add a new endpoint: `https://your-domain.com/api/webhooks/stripe`.
3. Select events to listen to:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
4. Copy the **Signing Secret** (`whsec_...`) and add it to your `.env`.

## 3. How to Use

### Step 1: Link Service to Stripe
1. Go to **Services** (`/admin/services`).
2. Edit a recurring service (e.g., "Maintenance").
3. In the new **Stripe Integration** section, paste the **Stripe Price ID** (starts with `price_...`).
   *(You can find this ID in your Stripe Dashboard under Products > Pricing).*

### Step 2: Create Subscription & Send Link
1. Go to **Client Detail > Overview**.
2. Click **Add Subscription** and select the service.
3. Once added, you will see a **"Link Payment"** button on the subscription card.
4. Click it to copy the **Payment Link** and send it to your client.

### Step 3: Automation (Magic 🪄)
- When the client pays, the Subscription status automatically updates to **"Stripe Linked"**.
- Each month, when the recurring payment succeeds, a **Paid Invoice** record is automatically created in your system under the "Invoices" tab.
- This creates a perfect audit trail without you doing anything.
