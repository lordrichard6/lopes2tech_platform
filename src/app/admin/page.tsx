'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FolderKanban, FileText, Inbox } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
    const stats = [
        {
            title: "Clients",
            value: "Manage Clients",
            description: "View and edit client accounts",
            icon: Users,
            href: "/admin/clients",
            color: "text-blue-500",
        },
        {
            title: "Projects",
            value: "Manage Projects",
            description: "Track projects and milestones",
            icon: FolderKanban,
            href: "/admin/projects",
            color: "text-green-500",
        },
        {
            title: "Inbox",
            value: "Task Requests",
            description: "Review incoming client requests",
            icon: Inbox,
            href: "/admin/inbox",
            color: "text-orange-500",
        },
        {
            title: "Invoices",
            value: "Manage Invoices",
            description: "Create and track payments",
            icon: FileText,
            href: "/admin/invoices",
            color: "text-purple-500",
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                <p className="text-muted-foreground">
                    Welcome back. Here&apos;s an overview of your platform.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
