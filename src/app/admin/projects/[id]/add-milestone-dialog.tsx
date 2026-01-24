'use client'

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"
import { createMilestoneAction } from "./actions"

interface AddMilestoneDialogProps {
    projectId: string
    services: any[]
}

const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().optional(),
    due_date: z.string().optional(),
    service_id: z.string().optional(),
})

export function AddMilestoneDialog({ projectId, services }: AddMilestoneDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            due_date: "",
            service_id: "none",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        const formData = new FormData()
        formData.append('projectId', projectId)
        formData.append('title', values.title)
        if (values.description) formData.append('description', values.description)
        if (values.due_date) formData.append('dueDate', values.due_date)

        // Handle serviceId
        if (values.service_id && values.service_id !== "none") {
            formData.append('serviceId', values.service_id)
        }

        await createMilestoneAction(formData)

        toast.success("Milestone created successfully")
        setOpen(false)
        form.reset()
        // No need to manually refresh if the server action calls revalidatePath, 
        // but router.refresh() handles client-side cache updates nicely.
        // The action is calling revalidatePath, which is good.
        // However, since we are in a client component using a server action imported, 
        // the server action response will trigger a refresh on the page usually. 
        // But adding router.refresh() is safer for instant feedback if the action doesn't return specifically.
        // We'll trust the revalidatePath from the action for now, but adding router.refresh() just in case.
        // Actually actions.ts creates redirects on error but otherwise revalidates. 
        // Using form action directly in the previous implementation handled it. 
        // Here we are calling the async function.
        // Let's assume revalidatePath works.
        router.refresh()
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Milestone</DialogTitle>
                    <DialogDescription>
                        Define a new deliverable for this project.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Design Phase" {...field} />
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
                                        <Textarea placeholder="Optional details..." className="min-h-[80px]" {...field} />
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
                        <FormField
                            control={form.control}
                            name="service_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select service" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">No Service</SelectItem>
                                            {services.map((s: any) => (
                                                <SelectItem key={s.service_id} value={s.service_id}>
                                                    {s.services?.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Milestone
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
