'use client'

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Trash2, CheckCircle2 } from "lucide-react"
import { deleteMilestoneAction, updateMilestoneStatusAction } from "./actions"
import { format, isBefore, isToday, startOfToday } from "date-fns"
import { motion } from "framer-motion"
import { EditMilestoneDialog } from "./edit-milestone-dialog"

interface Milestone {
    id: string
    title: string
    description?: string
    status: 'pending' | 'completed'
    due_date?: string
    service_id?: string
    services?: {
        name: string
    }
}

interface MilestoneCardProps {
    milestone: Milestone
    projectId: string
    services: any[]
}

export function MilestoneCard({ milestone, projectId, services }: MilestoneCardProps) {
    const isCompleted = milestone.status === 'completed'

    // Date Logic
    const dueDate = milestone.due_date ? new Date(milestone.due_date) : null
    const isOverdue = dueDate && !isCompleted && isBefore(dueDate, startOfToday())
    const isDueToday = dueDate && !isCompleted && isToday(dueDate)

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "group relative overflow-hidden rounded-lg border p-3 transition-all hover:shadow-sm",
                isCompleted
                    ? "bg-slate-50/50 border-slate-200 dark:bg-slate-900/20 dark:border-slate-800"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800",
                isOverdue && !isCompleted && "border-red-200 bg-red-50/30 dark:border-red-900/50 dark:bg-red-900/10",
                isDueToday && !isCompleted && "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/10"
            )}>
            {/* Left Color Accent Bar */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-colors",
                isCompleted ? "bg-emerald-500" :
                    isOverdue ? "bg-red-500" :
                        isDueToday ? "bg-amber-500" : "bg-blue-500"
            )} />

            <div className="flex items-start gap-3 pl-2">

                {/* Status Checkbox/Icon */}
                <div className="pt-0.5">
                    <form action={updateMilestoneStatusAction}>
                        <input type="hidden" name="milestoneId" value={milestone.id} />
                        <input type="hidden" name="projectId" value={projectId} />
                        <input type="hidden" name="status" value={isCompleted ? 'pending' : 'completed'} />
                        <button
                            type="submit"
                            className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                                isCompleted
                                    ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-200 shadow-sm"
                                    : "border-slate-300 bg-transparent text-transparent hover:border-blue-500 hover:text-blue-500",
                                isOverdue && !isCompleted && "border-red-300 hover:border-red-500 hover:text-red-500",
                                isDueToday && !isCompleted && "border-amber-300 hover:border-amber-500 hover:text-amber-500"
                            )}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                    </form>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h4 className={cn(
                                    "font-medium text-sm leading-none tracking-tight",
                                    isCompleted && "text-muted-foreground line-through decoration-slate-400",
                                    isOverdue && "text-red-700 dark:text-red-400",
                                    isDueToday && "text-amber-700 dark:text-amber-400"
                                )}>
                                    {milestone.title}
                                </h4>
                                {isOverdue && (
                                    <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase tracking-wider font-bold">
                                        Overdue
                                    </Badge>
                                )}
                                {isDueToday && (
                                    <Badge variant="secondary" className="h-4 px-1 text-[9px] uppercase tracking-wider font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-300">
                                        Today
                                    </Badge>
                                )}
                            </div>

                            {milestone.services?.name && (
                                <Badge variant="secondary" className="text-[9px] font-medium h-4 px-1 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                    {milestone.services.name}
                                </Badge>
                            )}
                        </div>

                        {/* Actions (Hidden until hover) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 -mt-1 -mr-1">
                            <EditMilestoneDialog milestone={milestone} projectId={projectId} services={services} />

                            <form action={deleteMilestoneAction}>
                                <input type="hidden" name="milestoneId" value={milestone.id} />
                                <input type="hidden" name="projectId" value={projectId} />
                                <Button type="submit" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {milestone.description && (
                        <p className={cn(
                            "text-xs text-muted-foreground line-clamp-2 leading-relaxed pb-1",
                            isCompleted && "line-through opacity-70"
                        )}>
                            {milestone.description}
                        </p>
                    )}

                    {milestone.due_date && (
                        <div className={cn(
                            "flex items-center gap-1.5 text-[10px] font-medium",
                            isCompleted ? "text-slate-400" :
                                isOverdue ? "text-red-600 dark:text-red-400" :
                                    isDueToday ? "text-amber-600 dark:text-amber-400" : "text-slate-500"
                        )}>
                            <Calendar className="h-3 w-3" />
                            <span>
                                {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
