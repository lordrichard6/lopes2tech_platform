const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
function loadEnv() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=:#]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                process.env[key] = value;
            }
        });
    }
}

loadEnv();

// Load .env.prod for production credentials
const prodEnvPath = path.join(__dirname, '..', '.env.prod');
if (fs.existsSync(prodEnvPath)) {
    fs.readFileSync(prodEnvPath, 'utf8').split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });
}

// Use production URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bilzgtrlklvtwewwpwjv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

console.log(`Connecting to: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTasks() {
    console.log('🔍 Checking tasks in database...\n');

    // Get all tasks
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, status, requester_id, created_at, project_id')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tasks:', error);
        return;
    }

    console.log(`📊 Total tasks found: ${tasks?.length || 0}\n`);

    if (tasks && tasks.length > 0) {
        console.log('Tasks:');
        console.log('─'.repeat(100));
        tasks.forEach((task, index) => {
            console.log(`${index + 1}. ${task.title}`);
            console.log(`   ID: ${task.id}`);
            console.log(`   Status: ${task.status}`);
            console.log(`   Requester: ${task.requester_id}`);
            console.log(`   Project ID: ${task.project_id || 'None'}`);
            console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`);
            console.log('');
        });
    } else {
        console.log('No tasks found in database.');
    }

    // Check for tasks with status 'active' but no project
    const activeWithoutProject = tasks?.filter(t => t.status === 'active' && !t.project_id) || [];
    if (activeWithoutProject.length > 0) {
        console.log(`\n⚠️  Found ${activeWithoutProject.length} active tasks without projects:`);
        activeWithoutProject.forEach(task => {
            console.log(`   - ${task.title} (${task.id})`);
        });
    }
}

checkTasks().catch(console.error);
