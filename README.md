# Lopes2Tech Platform V2

The robust management platform for Lopes2Tech services, including invoicing, client management, project tracking, and digital proposals.

## Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database / Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) + Tailwind CSS
- **PDF Generation**: `react-pdf` + `swissqrbill` (Client-Side)

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v20+)
- Docker (for local Supabase)
- Supabase CLI (`npm install -g supabase`)

### 2. Environment Setup
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-local-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-local-service-role-key"
```

To get these keys, run `npx supabase status` after starting the database.

### 3. Start Supabase
Run the local database stack:
```bash
npx supabase start
```

### 4. Database Migrations (CRITICAL)
If you are setting up for the first time or pulling changes, **you must apply migrations**:

```bash
npx supabase migration up
```

> **Warning**: Do NOT use `npx supabase db reset` unless you want to delete all local data. `migration up` is the safe command to apply new schema changes.

### 5. Start the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Key Features & workflows

### 1. PDF & QR Bill Generation
We use **Client-Side Generation** for maximum reliability and performance.
- **Library**: `@react-pdf/renderer` generates the Invoice PDF directly in the browser.
- **QR Bills**: `swissqrbill` generates the SVG for the Swiss QR code, which is then embedded into the PDF or downloaded as a PNG/SVG.
- **Why?**: Server-side generation was prone to dependency errors (`pdfkit`) and RLS permission issues. The current solution ensures that what you see is what you get, and it works instantly without server latency.

### 2. Partial Payments & Schedules
Invoices can be split into installments.
- **Drafting**: Create a schedule in the Admin "Edit Payment Schedule" dialog.
- **Validation**: Schedules must sum up to the total invoice amount.
- **Status**: Installments start as `pending`.

### 3. Payment Verification Workflow ("I Have Paid")
To allow clients to pay via bank transfer without immediate API confirmation:
1.  **Client Action**: Client clicks **"I have paid"** appearing next to an installment.
2.  **System Status**: The installment status changes to `processing` (Amber/Orange badge).
3.  **Admin Action**:
    - Admin sees the `processing` status in the Payment Schedule table.
    - Admin checks the bank account.
    - Admin selects **Actions -> Confirm Payment** (marks as `paid`) or **Reject** (resets to `pending`).

### 4. Permissions & RLS
Row Level Security is enabled on all tables.
- **Admins**: Full access to all tables.
- **Clients**:
    - Can view their own `invoices`, `documents`, and `invoice_payment_schedules`.
    - Can READ `system_settings` (Bank details) for QR generation.
    - Can UPDATE `invoice_payment_schedules` status to `processing` ONLY.

---

## Troubleshooting

### "Permission denied for table users"
If you see RLS errors regarding `auth.users`:
- Ensure you have run migration `20260123204500_fix_rls_auth_users.sql`.
- We now verify identity using `auth.jwt() ->> 'email'` instead of querying the protected `users` table.

### "QR IBAN not configured"
- Go to Admin > Settings > System.
- Ensure **IBAN** and **QR IBAN** are filled out. The QR generator requires a valid QR-IBAN to function.

### "Migration failed"
- Check if your local Supabase stack is running (`npx supabase status`).
- Try `npx supabase db reset` only if you are okay with losing local data.
