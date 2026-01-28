# Subscription Payment Flow & Logs

## How Subscription Payments Work

### 1. **Initial Payment (Client Pays)**
   - Client clicks "Pay Now" on subscription
   - System creates Stripe Checkout Session
   - Client completes payment on Stripe
   - **Stripe Webhook**: `checkout.session.completed`
     - Links subscription to Stripe (`stripe_subscription_id`)
     - Links client to Stripe customer (`stripe_customer_id`)
     - Sets subscription status to `active`

### 2. **Recurring Payments (Monthly/Yearly Renewals)**
   - Stripe automatically charges client on renewal date
   - **Stripe Webhook**: `invoice.payment_succeeded`
     - Creates invoice record in `invoices` table
     - Invoice has:
       - `client_id`: Links to client
       - `status`: `'paid'`
       - `description`: `"Subscription Renewal: [Service Name]"`
       - `stripe_payment_intent_id`: Stripe payment ID
       - `amount`: Payment amount
       - `currency`: Payment currency

### 3. **Where to See Payment Logs**

#### **Option 1: Invoices Page (Current)**
   - Go to `/admin/invoices`
   - Filter by client
   - Look for invoices with description starting with "Subscription Renewal:"
   - These show all subscription payments

#### **Option 2: Client Detail Page - Invoices Tab**
   - Go to `/admin/clients/[id]`
   - Click "Invoices" tab
   - See all invoices including subscription renewals

#### **Option 3: Subscription Payment History (New - See Below)**
   - Added payment history directly in subscriptions card
   - Shows all invoices linked to each subscription

## Payment Tracking Details

### Database Tables:
1. **`subscriptions`** - Subscription records
   - `stripe_subscription_id`: Links to Stripe subscription
   - `status`: `active`, `cancelled`, etc.
   - `start_date`: When subscription started

2. **`invoices`** - Payment records (created by webhook)
   - `client_id`: Links to client
   - `stripe_payment_intent_id`: Stripe payment ID
   - `status`: `'paid'` for successful payments
   - `description`: Contains "Subscription Renewal: [Service Name]"

3. **`invoice_payments`** - Manual payment records
   - Used for bank transfers, manual payments
   - **Note**: Subscription payments via Stripe don't create entries here
   - Only invoices are created via webhook

## How to Verify a Client Has Paid

### Method 1: Check Invoices
```sql
SELECT * FROM invoices 
WHERE client_id = '[client_id]' 
AND description LIKE 'Subscription Renewal:%'
ORDER BY created_at DESC;
```

### Method 2: Check Stripe Status (Real-time)
- Admin client detail page shows Stripe subscription status
- Shows: `Paid`, `Past Due`, `Unpaid` badges
- Shows: Last payment date, Next payment date, Amount due

### Method 3: Check Stripe Dashboard
- Click "View in Stripe" button on subscription
- See full payment history in Stripe dashboard

## Current Limitations

1. **No direct payment history in subscriptions card**
   - Payments are tracked via invoices
   - Need to manually check invoices page

2. **No activity log entries for subscription payments**
   - Only invoices are created
   - No entries in `activity_logs` table

3. **Payment history not grouped by subscription**
   - All subscription invoices mixed with regular invoices
   - Hard to see payment history for specific subscription

## Solution: Added Payment History View

See the updated subscriptions card that now shows:
- Payment history for each subscription
- Links to related invoices
- Payment dates and amounts
- Direct link to invoice detail page
