-- Add 'partial' and 'overdue' to invoice_status enum
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'partial';
ALTER TYPE public.invoice_status ADD VALUE IF NOT EXISTS 'overdue';

-- Create invoice_payments table to track individual payments
CREATE TABLE public.invoice_payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text, -- e.g., 'stripe', 'bank_transfer', 'cash', 'twint'
  reference text, -- Payment reference number or transaction ID
  notes text,
  created_by uuid REFERENCES auth.users(id) -- Who recorded this payment
);

-- Add amount_paid column to invoices (will be calculated from payments)
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS amount_paid decimal(10, 2) DEFAULT 0 NOT NULL;

-- Create index for faster queries
CREATE INDEX idx_invoice_payments_invoice_id ON public.invoice_payments(invoice_id);

-- Enable RLS on invoice_payments
ALTER TABLE public.invoice_payments ENABLE ROW LEVEL SECURITY;

-- Admin can manage all payments
CREATE POLICY "Admins have full access to invoice_payments" ON public.invoice_payments
  FOR ALL USING (public.is_admin());

-- Clients can view payments for their own invoices
CREATE POLICY "Clients can view own invoice payments" ON public.invoice_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices i
      JOIN public.clients c ON c.id = i.client_id
      WHERE i.id = public.invoice_payments.invoice_id
      AND c.user_id = auth.uid()
    )
  );

-- Function to calculate total paid amount for an invoice
CREATE OR REPLACE FUNCTION public.calculate_invoice_paid_amount(invoice_uuid uuid)
RETURNS decimal(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_paid decimal(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM public.invoice_payments
  WHERE invoice_id = invoice_uuid;
  
  RETURN total_paid;
END;
$$;

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION public.update_invoice_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invoice_amount decimal(10, 2);
  total_paid decimal(10, 2);
  invoice_due_date date;
  new_status public.invoice_status;
BEGIN
  -- Get invoice details
  SELECT amount, amount_paid, due_date
  INTO invoice_amount, total_paid, invoice_due_date
  FROM public.invoices
  WHERE id = NEW.invoice_id;
  
  -- Calculate new total paid
  total_paid := public.calculate_invoice_paid_amount(NEW.invoice_id);
  
  -- Update amount_paid in invoices table
  UPDATE public.invoices
  SET amount_paid = total_paid
  WHERE id = NEW.invoice_id;
  
  -- Determine new status
  IF total_paid >= invoice_amount THEN
    new_status := 'paid';
  ELSIF total_paid > 0 THEN
    new_status := 'partial';
  ELSIF invoice_due_date IS NOT NULL AND invoice_due_date < CURRENT_DATE THEN
    new_status := 'overdue';
  ELSE
    new_status := 'pending';
  END IF;
  
  -- Update invoice status
  UPDATE public.invoices
  SET status = new_status
  WHERE id = NEW.invoice_id
  AND status != 'cancelled'; -- Don't change cancelled invoices
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically update invoice status when payment is added
CREATE TRIGGER trigger_update_invoice_status_on_payment
AFTER INSERT OR UPDATE OR DELETE ON public.invoice_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_invoice_status();

-- Add comment explaining the payment flow
COMMENT ON TABLE public.invoice_payments IS 'Tracks individual payments made against invoices, enabling partial payment support';
