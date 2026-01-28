
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Calendar, ChevronRight, Filter } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { buildActivityVM } from "./activity-model"

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

    // 2. Fetch User Profiles (profiles has no email column)
    const userIds = Array.from(new Set(logs?.map(l => l.user_id).filter(Boolean) || []));
    let profilesMap: Record<string, any> = {};

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username, avatar_url')
            .in('id', userIds);

        profiles?.forEach(p => {
            profilesMap[p.id] = p;
        });
    }

    const activities = (logs || []).map((log: any) => buildActivityVM(log, log.user_id ? profilesMap[log.user_id] : null))

    // Formatting date helper
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-CH', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(date);
    }

    const formatDay = (date: Date) =>
        new Intl.DateTimeFormat('en-CH', { weekday: 'short', month: 'short', day: 'numeric' }).format(date)

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

            <div className="space-y-4">
                {activities.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground border rounded-lg bg-card">
                        No activity logs found.
                    </div>
                )}

                {activities.length > 0 && (
                    <div className="space-y-6">
                        {Object.entries(
                            activities.reduce((acc: Record<string, typeof activities>, a) => {
                                const key = a.when.toDateString()
                                acc[key] = acc[key] || []
                                acc[key].push(a)
                                return acc
                            }, {})
                        ).map(([dayKey, dayActivities]) => (
                            <div key={dayKey} className="space-y-3">
                                <div className="sticky top-14 z-10 bg-background/80 backdrop-blur px-1">
                                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {formatDay(dayActivities[0]!.when)}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {dayActivities.map((a) => {
                                        const Icon = a.icon
                                        const initials = a.actor.name?.slice(0, 2).toUpperCase() || "U"
                                        const content = (
                                            <Card className="p-4 hover:bg-muted/20 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${a.accentClass}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-semibold">{a.title}</div>
                                                            {a.subtitle && (
                                                                <div className="text-xs text-muted-foreground">{a.subtitle}</div>
                                                            )}
                                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                    <Avatar className="h-5 w-5">
                                                                        <AvatarImage src={a.actor.avatarUrl || undefined} />
                                                                        <AvatarFallback>{initials}</AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="font-medium text-foreground">{a.actor.name}</span>
                                                                </div>
                                                                {a.chips.map((c, idx) => (
                                                                    <Badge key={idx} variant="secondary" className="text-[10px]">
                                                                        {c.label}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="whitespace-nowrap text-xs text-muted-foreground flex items-center gap-1 pt-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(a.when)}
                                                    </div>
                                                </div>
                                            </Card>
                                        )

                                        return a.href ? (
                                            <Link key={a.id} href={a.href} className="block">
                                                <div className="relative">
                                                    {content}
                                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-60" />
                                                </div>
                                            </Link>
                                        ) : (
                                            <div key={a.id}>{content}</div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
