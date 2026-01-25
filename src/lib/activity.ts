import { createClient } from '@supabase/supabase-js';

// Use Service Role for logging to bypass RLS on insertion if needed, 
// and to ensure we can log even if the user lacks specific permissions.
// However, in Next.js Server Actions, we usually have the environment variables.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ActivityAction =
    | 'login'
    | 'logout'
    | 'create_client'
    | 'update_client'
    | 'create_project'
    | 'update_project'
    | 'create_task'
    | 'create_invoice'
    | 'update_invoice'
    | 'send_invoice'
    | 'download_qr'
    | 'payment_received'
    | 'install_payment_verified'
    | 'document_uploaded'
    | 'document_signed';

export type EntityType =
    | 'system'
    | 'client'
    | 'project'
    | 'task'
    | 'invoice'
    | 'payment_schedule'
    | 'document'
    | 'user';

interface LogActivityParams {
    userId?: string;
    action: ActivityAction;
    entityType: EntityType;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

/**
 * Logs a system activity to the database.
 * Uses the Service Role key to ensure reliable logging.
 */
export async function logActivity({
    userId,
    action,
    entityType,
    entityId,
    metadata = {},
    ipAddress,
}: LogActivityParams) {
    try {
        const { error } = await supabaseAdmin
            .from('activity_logs')
            .insert({
                user_id: userId || null,
                action,
                entity_type: entityType,
                entity_id: entityId || null,
                metadata,
                ip_address: ipAddress || null,
            });

        if (error) {
            console.error('Failed to log activity:', error);
        }
    } catch (err) {
        console.error('Unexpected error logging activity:', err);
    }
}
