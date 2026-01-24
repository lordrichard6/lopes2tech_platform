const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'; // From .env.local

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createBucket() {
    console.log('Attempting to create "avatars" bucket...');

    const { data, error } = await supabase
        .storage
        .createBucket('avatars', {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/*']
        });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('Bucket "avatars" already exists.');
        } else {
            console.error('Error creating bucket:', error);
        }
    } else {
        console.log('Bucket "avatars" created successfully:', data);
    }
}

createBucket();
