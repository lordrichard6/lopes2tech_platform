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

    // 2. Fetch Recent Invoices for Activity Feed
    const { data: recentInvoices } = await supabase
        .from('invoices')
        .select('id, created_at, number, project:projects(name)')
        .order('created_at', { ascending: false })
        .limit(3)

    // 3. Fetch Recent Projects for Activity Feed
    const { data: recentProjects } = await supabase
        .from('projects')
        .select('id, created_at, name')
        .order('created_at', { ascending: false })
        .limit(2)

    // Combine Activity
    const activities = [
        ...(recentInvoices?.map(inv => ({
            id: inv.id,
            type: 'invoice' as const,
            description: `Invoice ${inv.number} created for ${(inv.project as any)?.name || 'Project'}`,
            date: inv.created_at
        })) || []),
        ...(recentProjects?.map(proj => ({
            id: proj.id,
            type: 'project' as const,
            description: `New project started: ${proj.name}`,
            date: proj.created_at
        })) || [])
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const stats = [
        {
            title: "Total Clients",
            value: clientsCount || 0,
            description: "Active client accounts",
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
