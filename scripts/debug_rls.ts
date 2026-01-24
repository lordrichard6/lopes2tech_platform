import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function debugPermissions() {
    console.log("--- Debugging Permissions ---");

    // 1. Check ALL profiles to see who is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profiles, error: profileError } = await adminClient
        .from('profiles')
        .select('id, full_name, role, username');

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
    } else {
        console.table(profiles);
    }

    // 2. Simulate the specific Invoice ID
    const invoiceId = '04ffddf4-cb0b-4f80-9773-14562865eee3';
    console.log(`\nChecking Invoice: ${invoiceId}`);

    const { data: invoice, error: invoiceError } = await adminClient
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

    if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
    } else {
        console.log("Invoice found:", { id: invoice.id, payment_plan_enabled: invoice.payment_plan_enabled });
    }

    // 3. Check existing schedules
    const { data: schedules, error: scheduleError } = await adminClient
        .from('invoice_payment_schedules')
        .select('*')
        .eq('invoice_id', invoiceId);

    if (scheduleError) {
        console.error("Error fetching schedules:", scheduleError);
    } else {
        console.log(`Found ${schedules.length} schedules.`);
    }
}

debugPermissions();
