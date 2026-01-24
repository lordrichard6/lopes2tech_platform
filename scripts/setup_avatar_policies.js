const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function setupAvatarBucket() {
    console.log('Setting up avatars bucket with policies...');

    // 1. Make bucket public (upsert bucket settings)
    const { error: bucketError } = await supabase
        .storage
        .updateBucket('avatars', {
            public: true,
            fileSizeLimit: 2097152, // 2MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

    if (bucketError) {
        console.error('Bucket update error:', bucketError);
    } else {
        console.log('Bucket updated to public with 2MB limit.');
    }

    // 2. Run SQL to create policies (using service role)
    const policySql = `
    -- Drop existing policies if any (to avoid conflicts)
    drop policy if exists "Avatar images are publicly accessible." on storage.objects;
    drop policy if exists "Users can upload their own avatar." on storage.objects;
    drop policy if exists "Users can update their own avatar." on storage.objects;

    -- 1. Everyone can view avatars (public)
    create policy "Avatar images are publicly accessible."
      on storage.objects for select
      using ( bucket_id = 'avatars' );

    -- 2. Authenticated users can upload to avatars bucket
    create policy "Users can upload their own avatar."
      on storage.objects for insert
      to authenticated
      with check ( bucket_id = 'avatars' );

    -- 3. Users can update files in avatars bucket
    create policy "Users can update their own avatar."
      on storage.objects for update
      to authenticated
      using ( bucket_id = 'avatars' );
  `;

    const { error: sqlError } = await supabase.rpc('exec_sql', { sql: policySql });

    if (sqlError) {
        // RPC might not exist, try direct query approach
        console.log('RPC method not available, policies may need manual setup.');
        console.log('Please run the following SQL in your Supabase dashboard:');
        console.log(policySql);
    } else {
        console.log('Storage policies created successfully!');
    }
}

setupAvatarBucket();
