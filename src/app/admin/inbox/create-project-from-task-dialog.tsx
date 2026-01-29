'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Rocket } from "lucide-react"
import { CreateProjectDialog } from "../clients/[id]/create-project-dialog"

interface Task {
    id: string
    title: string
    description?: string | null
    quote_amount?: number | null
    quote_currency?: string | null
}

interface CreateProjectFromTaskDialogProps {
    task: Task
    clientId: string
    availableServices: Array<{
        id: string
        name: string
        price: number
        billing_type: 'one_time' | 'monthly' | 'yearly'
    }>
}

export function CreateProjectFromTaskDialog({ task, clientId, availableServices }: CreateProjectFromTaskDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <CreateProjectDialog 
            clientId={clientId}
            availableServices={availableServices}
            taskId={task.id}
            initialData={{
                name: task.title,
                description: task.description || '',
                budget: task.quote_amount || undefined,
            }}
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button size="sm" type="button">
                    <Rocket className="h-4 w-4 mr-1" />
                    Create Project
                </Button>
            }
        />
    )
}
