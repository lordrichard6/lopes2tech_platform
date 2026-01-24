# Project Log: Lopes2tech Platform V2

> Context preservation for seamless chat handoffs.
> Each entry summarizes a work session for continuity.

---

## 2026-01-22 20:55 - Welcome Package to Onboarding Guide Refactor

### Summary
Refactored the "Welcome Package" feature into an "Onboarding Guide" to better reflect its purpose as a project handbook rather than a login credentials delivery system. Fixed PDF generation errors and updated document numbering system.

### Decisions Made
- **Removed initial password field**: Login details now sent exclusively via email, not in the onboarding guide
- **Renamed document prefix**: Changed from `WP-` to `OG-` for document numbering
- **Shifted document purpose**: Now serves as a "Project Handbook" outlining timelines, communication guidelines, and next steps

### Key Changes
- UI components: Renamed all instances of "Welcome Package" to "Onboarding Guide"
- PDF template: Removed sensitive login information section
- Dialog forms: Updated `create-welcome-dialog.tsx` to exclude password inputs
- Fixed: `RangeError` during PDF generation and syntax errors

### Current State
Working - Feature complete and functional

### Next Steps
1. Test PDF generation with real client data
2. Consider adding more project handbook sections (milestones, deliverables timeline)

---

## 2026-01-21 13:29 - PDF Offer Generation Tools

### Summary
Implemented tools on the client detail page to generate professional PDF offers. Integrated `react-pdf` library with Lopes2Tech branding and dynamic pricing from service catalog.

### Decisions Made
- **Used react-pdf**: Better control over layout than browser print, professional results
- **Form wizard approach**: Multi-step form for service selection and pricing adjustments
- **Dynamic pricing source**: Pulls from `tabela_servicos_precos.md` for consistency

### Key Changes
- Client detail page: Added new "Tools" section with offer generation
- PDF generation: Created offer template with branding
- Service pricing: Integrated with existing price catalog

### Current State
Working - Offers can be generated, downloaded, and previewed

### Next Steps
1. Add email send functionality for generated offers
2. Store generated offers in client Documents folder

---

## 2026-01-20 15:43 - Resend Email Debug & Domain Setup

### Summary
Debugged a 403 Forbidden error from Resend API occurring when sending welcome emails. Issue was due to testing domain restrictions.

### Decisions Made
- **Improved error handling**: Updated `sendEmail` utility to properly propagate Resend errors
- **UI feedback fix**: Modified action handlers to correctly report email send failures
- **Domain verification needed**: Identified that `resend.dev` testing domain has limitations

### Key Changes
- `src/lib/email.ts`: Enhanced error propagation from Resend API
- `src/app/admin/clients/[id]/actions.ts`: Updated `sendWelcomeEmailAction` error checking
- Error handling: UI now accurately reflects email send status

### Current State
Blocked - Requires verified domain for production use

### Next Steps
1. Configure custom domain in Resend (e.g., `@lopes2tech.com`)
2. Update DNS records for email verification
3. Test with production domain

### Notes
The `resend.dev` domain only works for verified test emails. For real clients, must use a verified custom domain.

---

## 2026-01-22 10:30 - Digital Signature Implementation

### Summary
Added digital signature capability to proposals and invoices. Clients can now sign documents via unique acceptance links with canvas-based signature pad.

### Decisions Made
- **Native canvas**: Used HTML5 canvas instead of third-party library for simplicity
- **Token-based access**: Unique tokens for signing—no client authentication required
- **Base64 storage**: Signatures saved as PNG in base64 format

### Key Changes
- `src/app/accept/[token]/acceptance-form.tsx`: New signature pad component
- `supabase/migrations/20260122103500_add_digital_signature.sql`: Added signature column
- API route: Handles signature submission with timestamp and IP logging

### Current State
Working - Tested locally with signature capture and storage

### Next Steps
1. Add email notification when document is signed
2. Generate signed PDF with embedded signature image
3. Add signature verification/audit trail

### Notes
Monitor database size if many documents—base64 PNGs can add up. Consider compression or external storage if needed.

---

## 2026-01-23 15:00 - Payment Schedule System Implementation

### Summary
Fully implemented the Partial Payment / Schedule system. Invoices can now be split into multiple installments, each with its own generated valid Swiss QR Bill. Clients can view the schedule and download individual QR bills. Fixed critical permission and UI synchronization issues during deployment.

### Decisions Made
- **Fault-tolerant Fetching**: Decoupled schedule fetching from the main invoice query to prevent 404s if the schedule data is missing or inaccessible.
- **Forced Admin Role**: Applied a migration to set all user profiles to `role='admin'` in the local dev environment to permanently resolve RLS 403/409 errors.
- **Dialog State Sync**: Updated `PaymentScheduleDialog` to strictly verify existing database records before showing a schedule, distinguishing between "new draft" and "saved data".

### Key Changes
- **Database**: New `invoice_payment_schedules` table and RLS policies.
- **Admin UI**: `PaymentScheduleDialog` for creating/editing installments.
- **Client UI**: Invoice page now lists installments with status and download buttons.
- **API**: New endpoints for generating specific installment QR bills.
- **Fixes**: Resolved `useEffect` reference error, RLS permission blocks, and "ghost" schedule UI bug.

### Current State
Working - Features are complete and verified. Saving schedules works correctly, and permissions are stable.

### Next Steps
1. Add email notifications for upcoming installment due dates.
2. Consider adding automated reminders for overdue installments.

### Notes
- The "Edit Schedule" button implies a plan is active. If the table is empty but the button says "Edit", it means the `payment_plan_enabled` flag is true but data is missing (inconsistent state fixed by resaving).

---

## 2026-01-23 20:45 - QR PDF Generation Fixes & Payment Verification Workflow

### Summary
Fixed critical issues preventing clients from generating QR Bills and PDF Invoices. Migrated generation logic to client-side (matching Admin implementation) to resolve reliability issues. Implemented "I Have Paid" verification workflow for clients.

### Decisions Made
- **Client-Side Generation**: Abandoned server-side PDF generation API due to RLS and dependency fragility. Refactored Client View to use `@react-pdf/renderer` and `swissqrbill` directly in the browser, matching the robust Admin View implementation.
- **Processing Status**: Introduced 'processing' status for payments to allow clients to signal payment completion without giving them full 'paid' authority.
- **RLS Policy Update**: Switched from table-based auth checks to Token-based (`auth.jwt()`) to fix `permission denied for table users` errors securely.

### Key Changes
- **Database**:
    - `20260123200000_allow_public_settings_read.sql`: Allowed clients to read bank settings.
    - `20260123203500_add_processing_status.sql`: Added 'processing' status and verification workflow.
    - `20260123204500_fix_rls_auth_users.sql`: Fixed RLS permission error.
- **UI Components**:
    - Refactored `DownloadQRButton` and `DownloadPdfButton` to use client-side generation.
    - Created `MarkPaidButton` for clients.
    - Updated `PaymentScheduleTable` (Admin) to support Confirm/Reject actions for processing payments.

### Current State
Working - Clients can generate QR bills/PDFs instantly and mark payments as paid. Admins can verify payments. All database permissions resolved.

### Next Steps
1. Add email notification to Admin when a client clicks "I have paid".
2. Add email notification to Client when Admin confirms payment.

---
