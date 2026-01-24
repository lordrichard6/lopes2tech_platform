'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { format, differenceInDays, addMonths, startOfMonth, eachMonthOfInterval, isWithinInterval, differenceInMonths, endOfMonth } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
    description?: string;
    start_date?: string;
    deadline?: string;
    clients?: { name: string } | null;
};

export function ProjectTimeline({ projects }: { projects: Project[] }) {
    if (!projects.length) {
        return (
            <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/10">
                No projects to display in timeline.
            </div>
        );
    }

    // 1. Determine Date Range
    // Default to roughly this year, or dynamic based on projects
    const today = new Date();
    const startRange = startOfMonth(addMonths(today, -2)); // Start 2 months ago
    const endRange = endOfMonth(addMonths(today, 9)); // Show next 9 months

    const totalDays = differenceInDays(endRange, startRange);
    const months = eachMonthOfInterval({ start: startRange, end: endRange });

    function getPosition(dateStr?: string) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (date < startRange) return 0;
        if (date > endRange) return 100;
        const diff = differenceInDays(date, startRange);
        return (diff / totalDays) * 100;
    }

    function getWidth(start?: string, end?: string) {
        if (!start && !end) return 0;
        const s = start ? new Date(start) : today;
        const e = end ? new Date(end) : addMonths(s, 1);

        let startPos = getPosition(s.toISOString()) || 0;
        let endPos = getPosition(e.toISOString()) || 0;

        // Cap at 100% and 0%
        if (startPos < 0) startPos = 0;
        if (endPos > 100) endPos = 100;

        return Math.max(endPos - startPos, 1); // Min 1% width
    }

    // Filter projects that have at least one date or are active
    const visibleProjects = projects.filter(p =>
        p.status !== 'cancelled' &&
        (p.start_date || p.deadline)
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full border rounded-md">
                    <div className="min-w-[800px] p-4">
                        {/* Timeline Header (Months) */}
                        <div className="flex border-b pb-2 mb-4">
                            <div className="w-[200px] shrink-0 font-medium text-sm text-muted-foreground">Project</div>
                            <div className="flex-1 relative h-6">
                                {months.map((month, i) => {
                                    const left = (differenceInDays(month, startRange) / totalDays) * 100;
                                    return (
                                        <div
                                            key={i}
                                            className="absolute text-xs text-muted-foreground border-l pl-1 truncate"
                                            style={{ left: `${left}%`, width: `${(30 / totalDays) * 100}%` }}
                                        >
                                            {format(month, 'MMM yyyy')}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Projects Rows */}
                        <div className="space-y-4">
                            {visibleProjects.map(project => {
                                const left = getPosition(project.start_date) || getPosition(project.created_at || new Date().toISOString());
                                const width = getWidth(project.start_date || project.created_at, project.deadline);

                                return (
                                    <div key={project.id} className="flex items-center group">
                                        <div className="w-[200px] shrink-0 truncate pr-4 text-sm font-medium">
                                            {project.name}
                                            <div className="text-xs text-muted-foreground">{project.clients?.name}</div>
                                        </div>
                                        <div className="flex-1 relative h-8 bg-muted/20 rounded-full">
                                            {/* Grid Lines */}
                                            {months.map((month, i) => {
                                                const lineLeft = (differenceInDays(month, startRange) / totalDays) * 100;
                                                return i > 0 && (
                                                    <div
                                                        key={i}
                                                        className="absolute inset-y-0 border-l border-dashed border-muted/50 w-px"
                                                        style={{ left: `${lineLeft}%` }}
                                                    />
                                                );
                                            })}

                                            {/* Current Day Line */}
                                            <div
                                                className="absolute inset-y-0 border-l-2 border-primary/50 z-10"
                                                style={{ left: `${getPosition(new Date().toISOString())}%` }}
                                                title="Today"
                                            />

                                            {/* Bar */}
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <div
                                                        className="absolute h-6 top-1 rounded-sm bg-primary/80 hover:bg-primary transition-all cursor-pointer flex items-center px-2 overflow-hidden"
                                                        style={{
                                                            left: `${left}%`,
                                                            width: `${width}%`,
                                                            minWidth: '20px'
                                                        }}
                                                    >
                                                        <span className="text-[10px] text-primary-foreground font-medium truncate pointer-events-none">
                                                            {project.progress}%
                                                        </span>
                                                    </div>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80">
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-semibold">{project.name}</h4>
                                                        <div className="text-xs text-muted-foreground">
                                                            {project.clients?.name}
                                                        </div>
                                                        <div className="pt-2 flex justify-between text-xs">
                                                            <span>Start: {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'N/A'}</span>
                                                            <span>End: {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'N/A'}</span>
                                                        </div>
                                                        <Badge variant="outline" className="mt-2 text-xs">
                                                            {project.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <div className="w-0.5 h-4 bg-primary/50"></div>
                        <span>Today</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
