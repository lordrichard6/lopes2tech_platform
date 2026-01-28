-- Add invoice line items and extra invoice metadata

-- 1) Invoice items table (line-level detail)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  position INT NOT NULL, -- 1-based ordering of items

  -- what this line represents
  type TEXT NOT NULL DEFAULT 'item', -- e.g. 'service', 'product', 'discount', 'note'
  name TEXT NOT NULL,
  description TEXT,

  -- optional link back to a service definition
  service_id UUID REFERENCES public.services(id),

  -- pricing
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_label TEXT, -- e.g. 'hour', 'month', 'unit'
  unit_price NUMERIC(10,2) NOT NULL, -- in invoice currency

  -- per-line adjustments (optional, can be null)
  discount_percent NUMERIC(5,2),
  tax_rate_percent NUMERIC(5,2),

  -- denormalised amounts for easier reporting
  line_subtotal NUMERIC(12,2),       -- quantity * unit_price before discounts
  line_discount_amount NUMERIC(12,2),
  line_tax_amount NUMERIC(12,2),
  line_total NUMERIC(12,2)          -- final amount contributed to invoice total
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items (invoice_id);

-- 2) Extra metadata on invoices (non-breaking, all nullable / defaulted)
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS invoice_number TEXT,
  ADD COLUMN IF NOT EXISTS issue_date DATE,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB;

