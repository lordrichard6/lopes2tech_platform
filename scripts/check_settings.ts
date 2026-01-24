
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSettings() {
    console.log('Fetching system settings...');
    const { data: settings, error } = await supabase
        .from('system_settings')
        .select('*');

    if (error) {
        console.error('Error details:', error);
        return;
    }

    if (!settings || settings.length === 0) {
        console.log('No settings found in system_settings table.');
    } else {
        console.log('Found settings:', settings);
    }
}

checkSettings();
