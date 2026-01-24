"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Search,
    MoreHorizontal,
    Users,
    Sparkles,
    Hammer,
    Rocket,
    ShieldCheck,
    LayoutGrid,
    List
} from "lucide-react";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Client {
    id: string;
    contact_email: string | null;
    name: string | null;
    company_name?: string | null;
    status: string | null;
    created_at: string;
    avatar_url?: string | null;
}

interface ClientTableProps {
    data: Client[];
}

export function ClientTable({ data }: ClientTableProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const filteredClients = data.filter((client) => {
        const matchesSearch =
            (client.contact_email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (client.name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
            ) ||
            (client.company_name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase()
            );

        const matchesStatus =
            statusFilter === "all" ||
            (client.status || "").toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusConfig = (status: string | null) => {
        const s = (status || "").toLowerCase();
        if (s === "lead") {
            return { icon: Sparkles, label: "Lead", color: "text-yellow-500" };
        } else if (s === "dev" || s === "in_development") {
            return { icon: Hammer, label: "In Development", color: "text-blue-500" };
        } else if (s === "active" || s === "done") {
            return { icon: Rocket, label: "Active", color: "text-green-500" };
        } else if (s === "maintenance") {
            return { icon: ShieldCheck, label: "Maintenance", color: "text-orange-500" };
        }
        return { icon: Users, label: status || "Unknown", color: "text-muted-foreground" };
    };

    const getAvatarUrl = (url?: string | null) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${url}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-9 bg-background/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted rounded-lg p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'list' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${viewMode === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                    <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                    >
                        <SelectTrigger className="w-[180px] bg-background/50">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="lead">Lead</SelectItem>
                            <SelectItem value="dev">In Development</SelectItem>
                            <SelectItem value="done">Active / Done</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="rounded-md border bg-card/50 backdrop-blur-sm">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        No clients found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredClients.map((client) => (
                                    <TableRow key={client.id} className="group">
                                        <TableCell>
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={getAvatarUrl(client.avatar_url)} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                    {getInitials(client.name || client.contact_email || "?")}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">
                                                    {client.name || "Unnamed Client"}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {client.contact_email}
                                                </span>
                                                {client.company_name && (
                                                    <span className="text-xs text-primary/80 mt-0.5">
                                                        {client.company_name}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger asChild>
                                                        <div className="w-fit cursor-help">
                                                            {(() => {
                                                                const config = getStatusConfig(client.status);
                                                                const Icon = config.icon;
                                                                return <Icon className={`h-5 w-5 ${config.color}`} />;
                                                            })()}
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{getStatusConfig(client.status).label}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {format(new Date(client.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/clients/${client.id}`}>
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        Send Email
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredClients.map((client) => {
                        const statusConfig = getStatusConfig(client.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                            <Link href={`/admin/clients/${client.id}`} key={client.id} className="block group h-full">
                                <div className="relative h-full overflow-hidden rounded-xl border bg-card/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-card/50 group-hover:-translate-y-1">
                                    {/* Gradient Border Glow on Hover */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl bg-gradient-to-r from-transparent via-primary/20 to-transparent -z-10 blur-xl" />

                                    <div className="p-4 flex flex-col items-center text-center gap-3 relative z-10">
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 border-2 border-background shadow-md transition-transform duration-300 group-hover:scale-110">
                                                <AvatarImage src={getAvatarUrl(client.avatar_url)} className="object-cover" />
                                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                                                    {getInitials(client.name || client.contact_email || "?")}
                                                </AvatarFallback>
                                            </Avatar>
                                            {/* Status Dot */}
                                            <div className="absolute bottom-0 right-0 p-1 bg-background rounded-full">
                                                <div className={`h-3 w-3 rounded-full ${statusConfig.color.replace('text-', 'bg-')} ring-2 ring-background animate-pulse`} />
                                            </div>
                                        </div>

                                        <div className="w-full min-w-0 px-2 space-y-1">
                                            <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                                                {client.name || "Unnamed"}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate font-medium">
                                                {client.company_name || client.contact_email}
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color.replace('text-', 'border-').replace('500', '200')} ${statusConfig.color.replace('text-', 'bg-').replace('500', '50')} dark:bg-opacity-10`}>
                                            <StatusIcon className={`h-3 w-3 ${statusConfig.color}`} />
                                            <span className={statusConfig.color}>{statusConfig.label}</span>
                                        </div>
                                    </div>

                                    {/* Decorative subtle shine */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-gradient-to-tr from-white via-transparent to-transparent rotate-45" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredClients.length} of {data.length} clients
            </div>
        </div>
    );
}
