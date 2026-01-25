import { createClient } from "@/lib/supabase/server"
import { Users, FolderKanban, FileText, Inbox } from "lucide-react"
import { StatsCard } from "@/components/admin/dashboard/stats-card"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { RecentActivity } from "@/components/admin/dashboard/recent-activity"

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // 1. Fetch Stats
    const { count: clientsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')

    const { count: projectsCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })

    const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')

    // 2. Fetch Real Activity Logs (Plain, no join to auth.users)
    const { data: logs } = await supabase
        .from('activity_logs')
        .select(`
            id, 
            action, 
            entity_type, 
            metadata, 
            created_at,
            user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5)

    // 3. Fetch User Profiles for the logs (Manual Join)
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

    // Map logs to UI format
    const activities = logs?.map(log => {
        let description = log.action.replace(/_/g, ' ');
        const user = log.user_id ? profilesMap[log.user_id] : null;

        // Enhance description based on metadata
        if (log.action === 'create_invoice' && log.metadata?.amount) {
            description = `Created invoice for CHF ${log.metadata.amount}`;
        } else if (log.action === 'login') {
            const email = user?.email || log.metadata?.email || 'Unknown';
            description = `User logged in (${email})`;
        } else if (log.action === 'payment_received') {
            description = `Payment received: CHF ${log.metadata?.amount}`;
        } else if (log.action === 'create_client') {
            description = `New client: ${log.metadata?.name || 'Unknown'}`;
        } else if (log.action === 'create_project') {
            description = `New project: ${log.metadata?.name || 'Unknown'}`;
        }

        return {
            id: log.id,
            type: (log.entity_type === 'invoice' || log.entity_type === 'project' || log.entity_type === 'client')
                ? log.entity_type
                : 'client',
            description: description.charAt(0).toUpperCase() + description.slice(1),
            date: log.created_at,
            user: {
                name: user?.full_name || user?.email?.split('@')[0] || log.metadata?.email?.split('@')[0] || 'System',
                avatar: ''
            }
        };
    }) || [];

    const stats = [
        {
            title: "Total Clients",
            value: clientsCount || 0,
            description: "Registered clients",
            icon: Users,
            href: "/admin/clients",
            iconColor: "text-blue-500",
        },
        {
            title: "Active Projects",
            value: projectsCount || 0,
            description: "Projects in progress",
            icon: FolderKanban,
            href: "/admin/projects",
            iconColor: "text-emerald-500",
        },
        {
            title: "Pending Invoices",
            value: invoicesCount || 0,
            description: "Awaiting payment",
            icon: FileText,
            href: "/admin/invoices",
            iconColor: "text-violet-500",
        },
        {
            title: "Inbox",
            value: "Check Inbox",
            description: "View latest messages",
            icon: Inbox,
            href: "/admin/inbox",
            iconColor: "text-orange-500",
        },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your platform performance and activity.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <StatsCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Recent Activity */}
                <div className="md:col-span-2">
                    <RecentActivity activities={activities} />
                </div>

                {/* Right Column: Quick Actions & System Status */}
                <div className="space-y-6">
                    <QuickActions />
                </div>
            </div>
        </div>
    )
}
