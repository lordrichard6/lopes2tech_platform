# Running migrations on production

Use one of these approaches.

## Option 1: Link project, then push (recommended)

1. **Get your production project ref**  
   Supabase Dashboard → your project → **Project Settings** → **General** → **Reference ID** (e.g. `abcdefghijklmnop`).

2. **Log in and link**
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   ```
   When prompted, enter the database password for the project.

3. **Push migrations**
   ```bash
   npx supabase db push
   ```
   This applies all migrations that are not yet applied on the linked (production) database.

---

## Option 2: Push using database URL (no link)

If you prefer not to link, use the direct Postgres URL:

1. **Get the connection string**  
   Supabase Dashboard → **Project Settings** → **Database** → **Connection string** → **URI**.  
   Replace `[YOUR-PASSWORD]` with the real database password.

2. **Run**
   ```bash
   npx supabase db push --db-url "postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
   ```
   Or with the **Direct connection** URI (port 5432) if you use that instead.

---

## Notes

- **Backup:** For important data, take a snapshot/backup in the Supabase Dashboard before running migrations.
- **New migration in this repo:** `20260129100000_document_folders.sql` adds `document_folders` and `documents.folder_id`.
- **Local only:** For the local DB use `npx supabase db reset` or `npx supabase migration up` (with Supabase running via `npx supabase start`).
