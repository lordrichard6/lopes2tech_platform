'use client'

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Calendar, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"

interface Project {
    id: string
    name: string
    description?: string
    status: string
    budget?: number
    start_date?: string
    deadline?: string
    task_count: number
    completed_task_count: number
    milestone_count: number
    completed_milestone_count: number
}

interface LiquidProjectCardProps {
    project: Project
}

export function LiquidProjectCard({ project }: LiquidProjectCardProps) {
    const totalMilestones = project.milestone_count || 0
    const completedMilestones = project.completed_milestone_count || 0
    const totalTasks = project.task_count || 0
    const completedTasks = project.completed_task_count || 0

    // Calculate progress based on milestones if present, otherwise fallback to tasks
    const hasMilestones = totalMilestones > 0
    const hasTasks = totalTasks > 0

    let rawProgress = 0
    let progressLabel = "0% Done"
    let statusLabel = `${completedTasks}/${totalTasks} Tasks`

    if (hasMilestones) {
        rawProgress = (completedMilestones / totalMilestones) * 100
        progressLabel = `${Math.round(rawProgress)}% Done`
        statusLabel = `${completedMilestones}/${totalMilestones} Milestones`
    } else if (hasTasks) {
        rawProgress = (completedTasks / totalTasks) * 100
        progressLabel = `${Math.round(rawProgress)}% Done`
        statusLabel = `${completedTasks}/${totalTasks} Tasks`
    }

    const progress = Math.max(5, rawProgress)

    return (
        <Link href={`/admin/projects/${project.id}`} className="block h-full">
            <div className="group relative h-48 w-full overflow-hidden rounded-xl border bg-background shadow-sm transition-all hover:shadow-md">

                {/* Liquid Background */}
                <div className="absolute inset-0 z-0 flex items-end">
                    <motion.div
                        className="relative w-full bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors duration-500"
                        initial={{ height: "0%" }}
                        animate={{ height: `${progress}%` }}
                        transition={{
                            duration: 1.5,
                            ease: "easeInOut",
                            type: "spring",
                            damping: 20
                        }}
                    >
                        {/* Wave Animation on Top */}
                        <div className="absolute -top-3 left-0 right-0 h-6 overflow-hidden">
                            <motion.div
                                className="absolute top-0 left-0 w-[200%] h-full opacity-40 bg-[url('https://raw.githubusercontent.com/sw-yx/sw-yx/master/static/img/wave.svg')] bg-repeat-x bg-contain"
                                animate={{ x: ["0%", "-50%"] }}
                                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            />
                            <motion.div
                                className="absolute top-1 left-0 w-[200%] h-full opacity-60 bg-[url('https://raw.githubusercontent.com/sw-yx/sw-yx/master/static/img/wave.svg')] bg-repeat-x bg-contain"
                                style={{ backgroundPositionX: "100px" }}
                                animate={{ x: ["-25%", "-75%"] }}
                                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 flex h-full flex-col justify-between p-5">

                    <div>
                        <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {project.name}
                            </h3>
                            <div className="rounded-full bg-background/50 px-2 py-0.5 text-xs font-medium backdrop-blur-sm border">
                                {statusLabel}
                            </div>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {project.description || "No description provided."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {/* Stats Row */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                            {project.deadline && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Due {format(new Date(project.deadline), 'MMM d')}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{progressLabel}</span>
                            </div>
                        </div>

                        {/* Big Percentage Display (fades in when progress is high) */}
                        {rawProgress > 30 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 0.1, scale: 1 }}
                                className="absolute bottom-2 right-2 text-6xl font-black text-emerald-900 pointer-events-none"
                            >
                                {Math.round(rawProgress)}%
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
