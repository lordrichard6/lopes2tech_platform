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
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Plus, ArrowRight, ArrowLeft, Search } from "lucide-react"
import { createProjectAction } from "./project-actions"

interface Service {
    id: string
    name: string
    price: number
    billing_type: 'one_time' | 'monthly' | 'yearly'
}

interface CreateProjectDialogProps {
    clientId: string
    availableServices: Service[]
}

const formSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0).optional(),
    start_date: z.string().optional(),
    deadline: z.string().optional(),
    service_ids: z.array(z.string()).default([]),
})

export function CreateProjectDialog({ clientId, availableServices }: CreateProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    const oneTimeServices = availableServices.filter(s => s.billing_type === 'one_time')
    const filteredServices = oneTimeServices.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            budget: 0,
            start_date: new Date().toISOString().split('T')[0],
            deadline: "",
            service_ids: [],
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (step === 1) {
            setStep(2)
            return
        }

        setIsLoading(true)
        const result = await createProjectAction({
            client_id: clientId,
            ...values,
            budget: values.budget || 0
        })

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Project created successfully")
            setOpen(false)
            setStep(1)
            form.reset()
            router.refresh()
        }
        setIsLoading(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen) {
            setTimeout(() => setStep(1), 300) // Reset step after close animation
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{step === 1 ? 'Project Details' : 'Select Services'}</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Define the core information for this new project."
                            : "Choose services to associate with this project."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Website Redesign" {...field} />
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
                                                <Textarea placeholder="Brief project scope..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget (CHF)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="start_date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
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
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deadline</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search services..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {filteredServices.length > 0 ? (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto p-1">
                                        <FormField
                                            control={form.control}
                                            name="service_ids"
                                            render={() => (
                                                <FormItem>
                                                    {filteredServices.map((service) => (
                                                        <FormField
                                                            key={service.id}
                                                            control={form.control}
                                                            name="service_ids"
                                                            render={({ field }) => {
                                                                return (
                                                                    <FormItem
                                                                        key={service.id}
                                                                        className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:bg-muted/50 cursor-pointer"
                                                                    >
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value?.includes(service.id)}
                                                                                onCheckedChange={(checked) => {
                                                                                    return checked
                                                                                        ? field.onChange([...field.value, service.id])
                                                                                        : field.onChange(
                                                                                            field.value?.filter(
                                                                                                (value) => value !== service.id
                                                                                            )
                                                                                        )
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <div className="space-y-1 leading-none cursor-pointer" onClick={() => {
                                                                            const checked = !field.value?.includes(service.id)
                                                                            return checked
                                                                                ? field.onChange([...field.value, service.id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== service.id
                                                                                    )
                                                                                )
                                                                        }}>
                                                                            <FormLabel className="cursor-pointer">
                                                                                {service.name}
                                                                            </FormLabel>
                                                                            <p className="text-sm text-muted-foreground">
                                                                                CHF {service.price}
                                                                            </p>
                                                                        </div>
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    ))}
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No services found matching "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            {step === 2 ? (
                                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                                </Button>
                            ) : (
                                <div /> // Spacer
                            )}

                            <Button type="submit" disabled={isLoading}>
                                {step === 1 ? (
                                    <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
                                ) : (
                                    <>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Project</>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
