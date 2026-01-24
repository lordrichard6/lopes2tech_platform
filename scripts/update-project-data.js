
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Try to load env from .env.local or .env
let envConfig = {};
try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envConfig[key.trim()] = val.trim();
    });
} catch (e) {
    console.log('Could not read .env.local, trying .env');
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, val] = line.split('=');
            if (key && val) envConfig[key.trim()] = val.trim();
        });
    } catch (e2) {
        console.error('Could not find .env file');
        process.exit(1);
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Ideally we need service role key to bypass RLS if strict, but anon might work if user is authenticated or tables are open.
// Given this is a local script, we might fail on RLS if we don't have service role.
// Let's try anon key first, but typically we need SERVICE_ROLE_KEY for admin scripts.

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateProject() {
    // We need to find the specific project. 
    // We'll search for "Website with brand" or "Lopes2Tech Website" (in case it was partially updated)
    const { data: projects, error: searchError } = await supabase
        .from('projects')
        .select('*')
        .ilike('name', '%Website with brand%');

    if (searchError) {
        console.error('Error searching project:', searchError);
        return;
    }

    if (!projects || projects.length === 0) {
        console.log('Project "Website with brand" not found. It might have been renamed already.');
        return;
    }

    const project = projects[0];
    console.log(`Updating project: ${project.name} (${project.id})`);

    const { error: updateError } = await supabase
        .from('projects')
        .update({
            name: 'Lopes2Tech Website',
            description: 'The central brand presence and platform for Lopes2Tech services. Features multi-language support, AI Chat Widget, Client Portal, and SEO optimization.',
            budget: 2500,
            // Assuming start_date and deadline might already be set or we keep them as is
        })
        .eq('id', project.id);

    if (updateError) {
        console.error('Error updating project:', updateError);
    } else {
        console.log('Successfully updated project data!');
    }
}

updateProject();
