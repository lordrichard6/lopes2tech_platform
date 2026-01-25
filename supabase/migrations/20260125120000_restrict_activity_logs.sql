
-- Revoke the client view policy to strictly enforce "Only the admin has access"
DROP POLICY IF EXISTS "Clients can view own activity logs" ON public.activity_logs;

-- Ensure Admin policy remains
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admins can view all activity logs" ON public.activity_logs
    FOR SELECT
    USING (public.is_admin());

-- Ensure Insertion allows authenticated users (so their actions can be logged via RLS if not using service role)
-- But primarily we use Service Role in backend actions.
-- Keeping this just in case, or we can rely purely on Service Role.
-- Let's keep "Service Role" as the main writer, but "Authenticated" can insert if needed for client-side triggers (though rare).
