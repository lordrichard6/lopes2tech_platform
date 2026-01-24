'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { updateInvoiceAction } from "./actions"
import { createClient } from "@/lib/supabase/client"

interface EditInvoiceDialogProps {
    invoice: {
        id: string
        client_id: string
        project_id?: string | null
        amount: number
        description?: string
        status: string
        due_date?: string | null
        currency: string
    }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const formSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().optional(),
    status: z.string(),
    due_date: z.string().optional(),
    client_id: z.string().min(1, "Client is required"),
    project_id: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function EditInvoiceDialog({ invoice, open: externalOpen, onOpenChange: externalOnOpenChange }: EditInvoiceDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: invoice.amount,
            description: invoice.description || "",
            status: invoice.status,
            due_date: invoice.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : "",
            client_id: invoice.client_id,
            project_id: invoice.project_id || "unassigned",
        },
    })

    // Use external open state if provided, otherwise use internal
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
    const setIsOpen = externalOnOpenChange || setInternalOpen

    useEffect(() => {
        async function fetchData() {
            const supabase = createClient()
            const { data: clientsData } = await supabase.from('clients').select('id, name')
            const { data: projectsData } = await supabase.from('projects').select('id, name')

            if (clientsData) setClients(clientsData)
            if (projectsData) setProjects(projectsData)
        }

        if (isOpen) {
            fetchData()
        }
    }, [isOpen])

    async function onSubmit(values: FormValues) {
        setIsLoading(true)

        const formData = new FormData()
        formData.append('id', invoice.id)
        formData.append('amount', values.amount.toString())
        formData.append('client_id', values.client_id)
        if (values.description) formData.append('description', values.description)
        formData.append('status', values.status)
        if (values.due_date) formData.append('due_date', values.due_date)
        if (values.due_date) formData.append('due_date', values.due_date)
        if (values.project_id && values.project_id !== "unassigned") {
            formData.append('project_id', values.project_id)
        } else {
            formData.append('project_id', "") // Send empty to clear it
        }

        const result = await updateInvoiceAction(formData)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Invoice updated successfully")
            // Use external handler if provided, otherwise internal
            if (externalOnOpenChange) {
                externalOnOpenChange(false)
            } else {
                setInternalOpen(false)
            }
            router.refresh()
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Invoice</DialogTitle>
                    <DialogDescription>
                        Update the invoice details.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="client_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select client" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {clients.map(client => (
                                                <SelectItem key={client.id} value={client.id}>
                                                    {client.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="project_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select project" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="unassigned">None</SelectItem>
                                            {projects.map(project => (
                                                <SelectItem key={project.id} value={project.id}>
                                                    {project.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount ({invoice.currency})</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="partial">Partial</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                                <SelectItem value="overdue">Overdue</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="due_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="e.g. Web Development - Phase 1" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
