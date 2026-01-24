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
    DialogTrigger,
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
import { Loader2, Plus } from "lucide-react"
import { createInvoiceAction } from "./actions"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
    client_id: z.string().min(1, "Client is required"),
    project_id: z.string().optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    description: z.string().optional(),
    due_date: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreateInvoiceDialogProps {
    onSuccess?: () => void;
}

export function CreateInvoiceDialog({ onSuccess }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([])
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: "",
            project_id: undefined,
            amount: 0,
            description: "",
            due_date: "",
        },
    })

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    async function fetchData() {
        const supabase = createClient()
        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, name')
            .order('name', { ascending: true })

        const { data: projectsData } = await supabase
            .from('projects')
            .select('id, name')
            .order('name', { ascending: true })

        if (clientsData) setClients(clientsData)
        if (projectsData) setProjects(projectsData)
    }

    async function onSubmit(values: FormValues) {
        setIsLoading(true)

        const formData = new FormData()
        formData.append('clientId', values.client_id)
        if (values.project_id && values.project_id !== "unassigned") {
            formData.append('projectId', values.project_id)
        }
        formData.append('amount', values.amount.toString())
        if (values.description) formData.append('description', values.description)
        if (values.due_date) formData.append('dueDate', values.due_date)

        const result = await createInvoiceAction(formData)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Invoice created successfully")
            setOpen(false)
            form.reset()
            router.refresh()
            if (onSuccess) onSuccess()
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Issue a payment request to a client.
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a client" />
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
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a project (optional)" />
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
                                        <FormLabel>Amount (CHF)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                        </div>

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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Invoice
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
