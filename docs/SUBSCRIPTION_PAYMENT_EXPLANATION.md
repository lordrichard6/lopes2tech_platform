# Subscription Payment Workflow - Complete Explanation

## 🎯 How Subscription Payments Work (Step-by-Step)

### **Step 1: Admin Creates Subscription**
- Admin goes to client detail page
- Clicks "+ Add Subscription"
- Selects a service (e.g., "Hosting: Monthly")
- Subscription is created in database with status `active`
- **At this point: NO payment has happened yet**

### **Step 2: Client Pays (Initial Payment)**
- Client logs into their portal
- Goes to "Subscriptions" page
- Sees their subscription
- Clicks "Pay Now" button
- System creates Stripe Checkout Session
- Client enters payment details on Stripe
- **Stripe Webhook**: `checkout.session.completed`
  - Links subscription to Stripe (`stripe_subscription_id` saved)
  - Links client to Stripe customer (`stripe_customer_id` saved)
  - Subscription status stays `active`

### **Step 3: Recurring Payments (Automatic)**
- Stripe automatically charges client every month/year (based on billing cycle)
- **Stripe Webhook**: `invoice.payment_succeeded`
  - **Creates invoice record** in `invoices` table
  - Invoice details:
    - `client_id`: Links to client
    - `status`: `'paid'` ✅
    - `description`: `"Subscription Renewal: Hosting: Monthly"`
    - `stripe_payment_intent_id`: Stripe payment ID
    - `amount`: Payment amount (e.g., 39.00)
    - `currency`: Payment currency (e.g., CHF)
    - `created_at`: Payment date

## 📊 How to See Payment Logs

### **Method 1: In Subscriptions Card (NEW - Easiest)**
1. Go to `/admin/clients/[client_id]`
2. Scroll to "Active Subscriptions" card
3. Find the subscription (e.g., "Hosting: Monthly")
4. Click on **"X payments recorded"** button (with receipt icon)
5. See expandable list showing:
   - Payment date
   - Amount paid
   - Link to invoice detail page
6. Click "View Invoice" to see full invoice details

### **Method 2: Invoices Page**
1. Go to `/admin/invoices`
2. Filter by client name
3. Look for invoices with description: `"Subscription Renewal: [Service Name]"`
4. These are all subscription payments

### **Method 3: Client Detail Page - Invoices Tab**
1. Go to `/admin/clients/[client_id]`
2. Click "Invoices" tab
3. See all invoices including subscription renewals

### **Method 4: Stripe Dashboard (Real-time)**
1. In subscriptions card, click "View in Stripe" button
2. See full payment history in Stripe dashboard
3. See payment status, dates, amounts, etc.

## 🔍 How to Verify Client Has Paid

### **Visual Indicators:**
1. **Payment Status Badge** (in subscriptions card):
   - ✅ **Green "Paid"** = Payment successful
   - ⚠️ **Amber "Past Due"** = Payment overdue
   - ❌ **Red "Unpaid"** = Payment failed

2. **Payment History Count**:
   - Shows "X payments recorded" if payments exist
   - Click to expand and see all payments

3. **Stripe Status** (if linked):
   - Shows "Last paid: [date]"
   - Shows "Next payment: [date]"
   - Shows "Amount due: CHF X.XX" if any

### **Database Check:**
```sql
-- Find all subscription payments for a client
SELECT * FROM invoices 
WHERE client_id = '[client_id]' 
AND description LIKE 'Subscription Renewal:%'
AND status = 'paid'
ORDER BY created_at DESC;
```

## 📝 Payment Tracking Logic

### **What Gets Created:**
- ✅ **Invoice record** in `invoices` table (created by webhook)
- ✅ **Payment linked** via `stripe_payment_intent_id`
- ✅ **Invoice status** = `'paid'`

### **What Does NOT Get Created:**
- ❌ **No entry** in `invoice_payments` table (that's for manual/bank transfers)
- ❌ **No entry** in `activity_logs` table (only invoices are created)

### **Key Point:**
**Subscription payments are tracked as INVOICES, not separate payment records.**

## 🎨 UI Features Added

### **In Subscriptions Card:**
- ✅ Payment history expandable section
- ✅ Shows payment count
- ✅ Shows payment dates and amounts
- ✅ Direct link to invoice detail page
- ✅ Green checkmark icon for paid status

### **Payment History Display:**
```
[Receipt Icon] 3 payments recorded [▼]
  ├─ ✅ Jan 28, 2026  CHF 39.00  [View Invoice]
  ├─ ✅ Dec 28, 2025  CHF 39.00  [View Invoice]
  └─ ✅ Nov 28, 2025  CHF 39.00  [View Invoice]
```

## 🚨 Common Questions

### **Q: Why don't I see payment history?**
**A:** Check:
1. Is subscription linked to Stripe? (needs `stripe_subscription_id`)
2. Has client paid at least once? (check invoices table)
3. Are invoices created with description `"Subscription Renewal: [Service Name]"`?

### **Q: How do I know if client paid?**
**A:** 
1. Check payment status badge (Green = Paid)
2. Check payment history count (shows "X payments recorded")
3. Check Stripe status (shows "Last paid: [date]")
4. Check invoices page for subscription renewal invoices

### **Q: Where are payments stored?**
**A:** In the `invoices` table:
- Description: `"Subscription Renewal: [Service Name]"`
- Status: `'paid'`
- Linked via `stripe_payment_intent_id` to Stripe

### **Q: Can I see payment history for a specific subscription?**
**A:** Yes! Click the "X payments recorded" button in the subscriptions card to expand payment history for that specific subscription.
