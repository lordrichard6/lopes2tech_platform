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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Plus, ArrowRight, ArrowLeft, Search } from "lucide-react"
import { createProjectAction } from "@/app/admin/clients/[id]/project-actions"
import { createClient } from "@/lib/supabase/client"

interface Service {
    id: string
    name: string
    price: number
    billing_type: 'one_time' | 'monthly' | 'yearly'
}

const formSchema = z.object({
    client_id: z.string().min(1, "Client is required"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0).optional(),
    start_date: z.string().optional(),
    deadline: z.string().optional(),
    service_ids: z.array(z.string()).default([]),
})

interface GlobalCreateProjectDialogProps {
    children?: React.ReactNode;
}

export function GlobalCreateProjectDialog({ children }: GlobalCreateProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
    const [services, setServices] = useState<Service[]>([])
    const router = useRouter()

    const oneTimeServices = services.filter(s => s.billing_type === 'one_time')
    const filteredServices = oneTimeServices.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: "",
            name: "",
            description: "",
            budget: 0,
            start_date: new Date().toISOString().split('T')[0],
            deadline: "",
            service_ids: [],
        },
    })

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    async function fetchData() {
        const supabase = createClient()

        // Fetch Clients
        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, name')
            .order('name', { ascending: true })
        if (clientsData) setClients(clientsData)

        // Fetch Services
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .order('name')
        if (servicesData) setServices(servicesData)
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (step === 1) {
            setStep(2)
            return
        }

        setIsLoading(true)
        const result = await createProjectAction({
            client_id: values.client_id,
            name: values.name,
            description: values.description,
            budget: values.budget ?? 0,
            start_date: values.start_date,
            deadline: values.deadline,
            service_ids: values.service_ids
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
            setTimeout(() => setStep(1), 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{step === 1 ? 'Project Details' : 'Select Services'}</DialogTitle>
                    <DialogDescription>
                        {step === 1
                            ? "Define the core information and select a client."
                            : "Choose services to associate with this project."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">

                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                                <FormField
                                    control={form.control}
                                    name="client_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Client <span className="text-red-500">*</span></FormLabel>
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
                                        No services found matching &quot;{searchQuery}&quot;.
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
                                <div />
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
