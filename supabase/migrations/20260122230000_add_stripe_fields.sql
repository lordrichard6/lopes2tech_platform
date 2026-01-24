-- Add Stripe fields to Clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- Add Stripe fields to Services
-- We need both Product ID (for the item) and Price ID (for the specific billing config)
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS stripe_product_id text,
ADD COLUMN IF NOT EXISTS stripe_price_id text;

-- Add Stripe fields to Subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id text UNIQUE,
ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false;

-- Create index for faster lookups during webhooks
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer_id ON public.clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
