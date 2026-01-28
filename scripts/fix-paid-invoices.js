/**
 * Fix invoices that are marked as 'paid' but have amount_paid = 0
 * Creates payment records for them
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}

loadEnv();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixPaidInvoices() {
    console.log('🔧 Fixing paid invoices with missing payment records...\n');

    // Find invoices that are marked as paid but have amount_paid = 0 or no payment records
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('id, amount, amount_paid, status, stripe_payment_intent_id, created_at')
        .eq('status', 'paid')
        .or('amount_paid.is.null,amount_paid.eq.0');

    if (error) {
        console.error('Error fetching invoices:', error);
        return;
    }

    if (!invoices || invoices.length === 0) {
        console.log('✅ No invoices need fixing');
        return;
    }

    console.log(`Found ${invoices.length} invoice(s) to fix\n`);

    for (const invoice of invoices) {
        console.log(`📄 Invoice ${invoice.id}`);
        console.log(`   Amount: ${invoice.amount}, Amount Paid: ${invoice.amount_paid || 0}, Status: ${invoice.status}`);

        // Check if payment record exists
        const { data: existingPayments } = await supabase
            .from('invoice_payments')
            .select('id')
            .eq('invoice_id', invoice.id);

        if (existingPayments && existingPayments.length > 0) {
            console.log(`   ⏭️  Payment record already exists, skipping`);
            continue;
        }

        // Create payment record
        const { error: paymentError } = await supabase
            .from('invoice_payments')
            .insert({
                invoice_id: invoice.id,
                amount: invoice.amount,
                payment_date: invoice.created_at ? invoice.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
                payment_method: invoice.stripe_payment_intent_id ? 'stripe' : 'manual',
                reference: invoice.stripe_payment_intent_id || `Manual payment for invoice ${invoice.id.slice(0, 8)}`,
                notes: 'Payment record created by fix script'
            });

        if (paymentError) {
            console.error(`   ❌ Error creating payment record:`, paymentError.message);
            continue;
        }

        // Update invoice amount_paid
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                amount_paid: invoice.amount,
                status: 'paid'
            })
            .eq('id', invoice.id);

        if (updateError) {
            console.error(`   ❌ Error updating invoice:`, updateError.message);
        } else {
            console.log(`   ✅ Fixed! Created payment record and updated amount_paid`);
        }
    }

    console.log('\n✅ Done!');
}

fixPaidInvoices();
