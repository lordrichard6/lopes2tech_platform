
import { createClient } from "@/lib/supabase/server"
import { Clock, User as UserIcon, Calendar, Filter } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ActivityPage() {
    const supabase = await createClient()

    // 1. Fetch Activity Logs (Limit 50)
    const { data: logs } = await supabase
        .from('activity_logs')
        .select(`
            id, 
            action, 
            entity_type, 
            entity_id,
            metadata, 
            created_at,
            user_id,
            ip_address
        `)
        .order('created_at', { ascending: false })
        .limit(50)

    // 2. Fetch User Profiles manually to avoid joining 'auth.users'
    const userIds = Array.from(new Set(logs?.map(l => l.user_id).filter(Boolean) || []));
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);

        profiles?.forEach(p => {
            profilesMap[p.id] = p;
        });
    }

    // 3. Map to UI
    const activities = logs?.map(log => {
        let description = log.action.replace(/_/g, ' ');
        // Metadata Enhancement
        if (log.action === 'create_invoice' && log.metadata?.amount) {
            description = `Created invoice for CHF ${log.metadata.amount}`;
        } else if (log.action === 'login') {
            description = `User logged in`;
        } else if (log.action === 'payment_received') {
            description = `Payment received: CHF ${log.metadata?.amount}`;
        } else if (log.action === 'create_client') {
            description = `New client: ${log.metadata?.name || 'Unknown'}`;
        } else if (log.action === 'create_project') {
            description = `New project: ${log.metadata?.name || 'Unknown'}`;
        }

        const userProfile = log.user_id ? profilesMap[log.user_id] : null;
        const userName = userProfile?.full_name ||
            userProfile?.email?.split('@')[0] ||
            log.metadata?.email?.split('@')[0] ||
            (log.user_id ? 'Unknown User' : 'System');

        const userEmail = userProfile?.email || log.metadata?.email;
        const isSystem = !log.user_id;

        return {
            id: log.id,
            description: description.charAt(0).toUpperCase() + description.slice(1),
            date: new Date(log.created_at),
            user: {
                name: userName,
                email: userEmail,
                isSystem
            },
            type: log.entity_type,
            meta: log.metadata,
            ip: log.ip_address
        }
    }) || []

    // Formatting date helper
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CH', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Activity Logs</h2>
                    <p className="text-muted-foreground">
                        Detailed audit trail of all platform events.
                    </p>
                </div>
                {/* Placeholder for future filtering */}
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md hover:bg-muted">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="p-6">
                    {/* Timeline Container */}
                    <div className="relative border-l border-muted ml-3 space-y-8">
                        {activities.map((activity, index) => (
                            <div key={activity.id} className="mb-8 ml-6 relative">
                                {/* Dot */}
                                <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${activity.user.isSystem ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                                    }`}>
                                    {activity.user.isSystem ? <Clock className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                </span>

                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {activity.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            by <span className="font-semibold text-foreground">{activity.user.name}</span>
                                            {activity.user.email && <span className="text-xs opacity-70 ml-1">({activity.user.email})</span>}
                                        </p>
                                        {/* Optional Metadata Details */}
                                        {activity.type === 'invoice' && activity.meta?.amount && (
                                            <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                Invoice #{activity.meta?.invoiceId?.split('-')[0] || 'Ref'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="whitespace-nowrap text-sm text-muted-foreground flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(activity.date)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {activities.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">
                                No activity logs found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
