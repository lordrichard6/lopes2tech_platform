'use client'

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical, Eye, Pencil, Clock, AlertTriangle,
    Search, ArrowUpDown, CheckCircle2, Layout, Download,
    Trash2, Calendar as CalendarIcon, List as ListIcon
} from "lucide-react";
import { EditProjectDialog } from "./[id]/edit-project-dialog";
import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProjectTimeline } from "./project-timeline";

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
    description?: string;
    budget?: number;
    start_date?: string;
    deadline?: string;
    created_at: string;
    clients?: { name: string } | null;
};

type SortConfig = {
    key: keyof Project | 'client';
    direction: 'asc' | 'desc';
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

    // Selection
    const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("projects")
            .select(`
                *,
                clients (
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (data) {
            setProjects(data as Project[]);
        }
        setLoading(false);
    }

    // Stats Calculation
    const stats = useMemo(() => {
        const total = projects.length;
        const active = projects.filter(p => p.status === 'active').length;
        const completed = projects.filter(p => p.status === 'completed').length;
        const overdue = projects.filter(p => {
            if (!p.deadline || p.status === 'completed' || p.status === 'cancelled') return false;
            return new Date(p.deadline) < new Date();
        }).length;

        return { total, active, completed, overdue };
    }, [projects]);

    // Filtering & Sorting
    const filteredProjects = useMemo(() => {
        let result = [...projects];

        // 1. Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.clients?.name.toLowerCase().includes(lowerQuery)
            );
        }

        // 2. Status Filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'overdue') {
                result = result.filter(p =>
                    p.deadline &&
                    new Date(p.deadline) < new Date() &&
                    p.status !== 'completed' &&
                    p.status !== 'cancelled'
                );
            } else {
                result = result.filter(p => p.status === statusFilter);
            }
        }

        // 3. Sorting
        result.sort((a, b) => {
            let aValue: any = a[sortConfig.key as keyof Project];
            let bValue: any = b[sortConfig.key as keyof Project];

            // Handle special cases
            if (sortConfig.key === 'client') {
                aValue = a.clients?.name || '';
                bValue = b.clients?.name || '';
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [projects, searchQuery, statusFilter, sortConfig]);

    // Selection Handlers
    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
        } else {
            setSelectedProjects(new Set());
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSelected = new Set(selectedProjects);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProjects(newSelected);
    };

    // Bulk Actions
    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedProjects.size} projects?`)) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('projects')
            .delete()
            .in('id', Array.from(selectedProjects));

        if (error) {
            toast.error("Failed to delete projects");
        } else {
            toast.success("Projects deleted successfully");
            setSelectedProjects(new Set());
            fetchProjects();
        }
    };

    // Export Handler
    const handleExportCSV = () => {
        const headers = ['Project Name', 'Client', 'Status', 'Progress', 'Budget', 'Start Date', 'Deadline', 'Created At'];

        // Use selected projects if any, otherwise all filtered projects
        const projectsToExport = selectedProjects.size > 0
            ? filteredProjects.filter(p => selectedProjects.has(p.id))
            : filteredProjects;

        const csvContent = [
            headers.join(','),
            ...projectsToExport.map(p => [
                `"${p.name}"`,
                `"${p.clients?.name || ''}"`,
                p.status,
                p.progress,
                p.budget || 0,
                p.start_date || '',
                p.deadline || '',
                p.created_at
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `projects_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSort = (key: keyof Project | 'client') => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    function handleEditClick(project: Project) {
        setEditingProject(project);
        setIsEditDialogOpen(true);
    }

    function handleDialogClose() {
        setIsEditDialogOpen(false);
        setEditingProject(null);
        fetchProjects();
    }

    function getDaysRemaining(deadline: string | undefined) {
        if (!deadline) return null;
        const days = differenceInDays(new Date(deadline), new Date());
        return days;
    }

    function getStatusColor(status: string) {
        switch (status) {
            case 'active': return 'default';
            case 'completed': return 'outline';
            case 'on_hold': return 'secondary';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground mt-2">Manage and track all ongoing projects.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="list"><ListIcon className="h-4 w-4 mr-2" />List</TabsTrigger>
                            <TabsTrigger value="timeline"><CalendarIcon className="h-4 w-4 mr-2" />Gantt</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="outline" onClick={handleExportCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild>
                        <Link href="/admin/projects/new">Add Project</Link>
                    </Button>
                </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-primary group">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium z-10">Total Projects</CardTitle>
                        <Layout className="h-4 w-4 text-primary z-10" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary z-10 relative">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-1 z-10 relative">Across all clients</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500 group">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium z-10">Active</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500 z-10" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 z-10 relative">{stats.active}</div>
                        <p className="text-xs text-muted-foreground mt-1 z-10 relative">Currently in progress</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-red-500 group">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium z-10">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500 z-10" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400 z-10 relative">{stats.overdue}</div>
                        <p className="text-xs text-muted-foreground mt-1 z-10 relative">Need attention</p>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-green-500 group">
                    <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium z-10">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500 z-10" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 z-10 relative">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground mt-1 z-10 relative">Successfully delivered</p>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar - Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {/* Status Filter */}
                <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full md:w-auto">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="on_hold">On Hold</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="overdue" className="text-red-500 data-[state=active]:text-red-600">Overdue</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {viewMode === 'list' ? (
                <>
                    {/* Bulk Selection Toolbar */}
                    {selectedProjects.size > 0 && (
                        <div className="bg-muted/50 p-2 rounded-lg flex items-center justify-between border">
                            <div className="text-sm font-medium px-2">
                                {selectedProjects.size} projects selected
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Selected
                                </Button>
                            </div>
                        </div>
                    )}

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
                                                onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                            />
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-2">
                                                Project Name
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('client')}>
                                            <div className="flex items-center gap-2">
                                                Client
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                                            <div className="flex items-center gap-2">
                                                Status
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[180px] cursor-pointer hover:bg-muted/50" onClick={() => handleSort('progress')}>
                                            <div className="flex items-center gap-2">
                                                Progress
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('budget')}>
                                            <div className="flex items-center gap-2">
                                                Budget
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('deadline')}>
                                            <div className="flex items-center gap-2">
                                                Deadline
                                                <ArrowUpDown className="h-4 w-4" />
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[100px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProjects.map((project) => {
                                        const daysRemaining = getDaysRemaining(project.deadline);
                                        const isOverdue = daysRemaining !== null && daysRemaining < 0;
                                        const isDueSoon = daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;
                                        const isSelected = selectedProjects.has(project.id);

                                        return (
                                            <TableRow
                                                key={project.id}
                                                className={cn(isOverdue && project.status !== 'completed' ? 'bg-red-50 dark:bg-red-950/20' : '', isSelected ? 'bg-muted/50' : '')}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelectOne(project.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {isOverdue && project.status !== 'completed' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                        {project.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{project.clients?.name || 'Unknown'}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusColor(project.status)}>
                                                        {project.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>{project.progress}%</span>
                                                        </div>
                                                        <Progress
                                                            value={project.progress}
                                                            className="h-2"
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {project.budget ? (
                                                        <span className="text-sm font-medium">
                                                            CHF {project.budget.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {project.deadline ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                <span className="text-sm">
                                                                    {format(new Date(project.deadline), 'MMM d, yyyy')}
                                                                </span>
                                                            </div>
                                                            {daysRemaining !== null && project.status !== 'completed' && (
                                                                <Badge
                                                                    variant={isOverdue ? 'destructive' : isDueSoon ? 'outline' : 'secondary'}
                                                                    className={cn("text-xs", isDueSoon && !isOverdue && "border-orange-500 text-orange-700")}
                                                                >
                                                                    {isOverdue
                                                                        ? `${Math.abs(daysRemaining)} days overdue`
                                                                        : daysRemaining === 0
                                                                            ? 'Due today'
                                                                            : `${daysRemaining} days left`
                                                                    }
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">No deadline</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/admin/projects/${project.id}`} className="flex items-center cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Project
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="flex items-center cursor-pointer"
                                                                onClick={() => handleEditClick(project)}
                                                            >
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit Project
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!filteredProjects.length && (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                No projects found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <ProjectTimeline projects={filteredProjects} />
            )}

            {/* Edit Dialog */}
            {editingProject && (
                <EditProjectDialog
                    project={editingProject}
                    open={isEditDialogOpen}
                    onOpenChange={(open) => {
                        if (!open) handleDialogClose();
                        setIsEditDialogOpen(open);
                    }}
                />
            )}
        </div>
    );
}
