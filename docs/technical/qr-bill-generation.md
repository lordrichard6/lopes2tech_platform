# Protocol: Swiss QR Bill Generation

> **Summary:** QR Bill generation is handled **exclusively on the client-side** to avoid server-side dependency issues with PDF generation libraries in the Next.js App Router environment.

## 1. Strategy Overview

We use a "Client-Side First" approach for QR Bills.
- **Generation:** The browser generates the QR Bill image (PNG) using the `swissqrbill` library's SVG output + HTML5 Canvas.
- **Preview:** The image is shown in a modal dialog.
- **Download:** The image is downloaded directly via an anchor tag.
- **Storage:** The QR Bill is **not** stored on the server; it is generated on-the-fly.

## 2. Technical Implementation

### Components
- **`src/lib/pdf/generate-qr-bill.ts`**: Helper utility.
  - `generateSwissQRRaw(data)`: Generates SVG element using `swissqrbill/svg`.
  - `generateSwissQRBase64(data)`: Converts that SVG to a PNG Base64 string using `canvas`. **(Browser Only)**.
- **`src/app/admin/invoices/[id]/payment-schedule-table.tsx`**: (Client Component)
  - Fetches settings via props.
  - Calls `generateSwissQRBase64`.
  - Displays/Downloads result.

### Data Flow
1. **Server (`page.tsx`)**: Fetches `system_settings` (for IBAN/Creditor info).
2. **Component Props**: Passes `settings` to `PaymentScheduleTable`.
3. **User Action**: Click "Preview" or "Download".
4. **Browser**:
   - Constructs `SwissQRBillData` object (validates IBAN, Address).
   - Generates SVG -> Canvas -> PNG Blob.
   - Shows/Downloads Blob.

## 3. Critical Configuration

The system requires valid `system_settings` in Supabase:
- `iban` OR `qr_iban`: Must be a valid Swiss IBAN.
- `creditor_country`: Must be "CH" (or 2-letter ISO).
- `creditor_zip`: Must be a valid zip code.

## 4. Troubleshooting

**"Failed to load SVG image"**
- Usually happens if `generateSwissQRBase64` is called on the server (Node.js has no `Image` or `window`).
- **Fix:** Ensure the code runs in a `useEffect` or event handler in a `"use client"` component.

**"IBAN not configured"**
- The code checks `settings.qr_iban` first, then falls back to `settings.iban`.
- Ensure at least one is set in **Admin > Settings > Invoice Defaults**.
