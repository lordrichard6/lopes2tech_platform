
import { createClient } from '@supabase/supabase-js';

import fs from 'fs';
import path from 'path';

// Manual .env parser
function parseEnv(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });
    return env;
}

// Load .env explicitly to get production keys
const envConfig = parseEnv(path.resolve(process.cwd(), '.env'));

const supabaseUrl = envConfig['NEXT_PUBLIC_SUPABASE_URL'] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig['SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createClientRecord() {
    console.log(`Checking/Creating client in DB: ${supabaseUrl}`);

    const clientData = {
        company_name: 'Ribeiro Consulting & Services',
        name: 'Ana Isabel Ribeiro Boleto Piriquito', // Combined name
        contact_email: 'mampiriquitohause@hotmail.com', // Mapped from email
        phone: '+41 79 172 06 45',
        street_address: 'Krastelstrasse 27', // Mapped from address
        city: 'Adlikon b. Regensdorf',
        postal_code: '8106',
        country: 'Switzerland',
        status: 'in-development'
        // notes: 'Imported...' // Omitted: Column missing in prod
    };

    // Check if already exists to avoid duplicates
    const { data: existing, error: searchError } = await supabase
        .from('clients')
        .select('*')
        .eq('contact_email', clientData.contact_email)
        .single();

    let clientId;

    if (existing) {
        console.log(`Client already exists with ID: ${existing.id}`);
        clientId = existing.id;
    } else {
        // Create new client
        const { data, error } = await supabase
            .from('clients')
            .insert([clientData])
            .select()
            .single();

        if (error) {
            console.error('Error creating client:', error);
            return;
        }
        console.log('Client created successfully:', data.id);
        clientId = data.id;
    }

    if (!clientId) return;

    // Create Project "Ribeiro Consulting Website"
    const projectData = {
        client_id: clientId,
        name: 'Ribeiro Consulting Website',
        description: 'Corporate website for a Swiss consulting firm. Budget: 2000 CHF. Start Date: 2025-12-22.',
        status: 'active', // Allowed: active, completed, on-hold
        // progress: 0 // Default
    };

    // Check if project exists
    const { data: existingProject } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId)
        .eq('name', projectData.name)
        .single();

    if (existingProject) {
        console.log('Project already exists:', existingProject.id);
        return;
    }

    const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

    if (projectError) {
        console.error('Error creating project:', projectError);
    } else {
        console.log('Project created successfully:');
        console.log(JSON.stringify(project, null, 2));
    }
}

createClientRecord();
