-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'login', 'create_invoice', 'payment_received'
    entity_type TEXT NOT NULL, -- e.g., 'invoice', 'client', 'project', 'system'
    entity_id UUID, -- Optional link to the specific record
    metadata JSONB DEFAULT '{}'::jsonb, -- Store extra details (amount, project_name, etc.)
    ip_address TEXT
);

-- Index for faster queries on logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- Add comments
COMMENT ON TABLE public.activity_logs IS 'Audit log of all important actions in the platform.';
COMMENT ON COLUMN public.activity_logs.action IS 'Standardized action verb (e.g., login, create, update, delete)';

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view ALL logs
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT
    USING (public.is_admin());

-- Policy: Admins can insert logs (or system/server actions)
-- Note: Server-side actions using service_role bypass RLS, but if we call from client-side (unlikely for audit), we might need this.
-- For safety, we generally only want backend to insert. 
-- However, creating a policy for insertion checks that the user is authenticated.
CREATE POLICY "Authenticated users can insert activity logs" ON public.activity_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Clients can view ONLY their own logs (where they are the actor)
CREATE POLICY "Clients can view own activity logs" ON public.activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Clients can view logs related to them? 
-- (Optional: If we want clients to see "Admin updated your invoice", we'd need a more complex policy involving entity ownership)
-- For now, stick to "User sees their own actions" + Admins see everything.
