'use client'

import { useState, useEffect, useMemo } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { Loader2, Plus, X, Minus } from "lucide-react"
import { createInvoiceAction } from "./actions"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
    client_id: z.string().min(1, "Client is required"),
    project_id: z.string().optional(),
    currency: z.enum(['CHF', 'EUR']).default('CHF'),
    description: z.string().optional(),
    due_date: z.string().optional(),
    items: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        quantity: z.number().min(0.01),
        price: z.number().min(0.01),
        unitLabel: z.string().optional(),
        service_id: z.string().optional(),
        type: z.string().optional(),
    })).min(1, "At least one item is required"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateInvoiceDialogProps {
    children?: React.ReactNode;
    onSuccess?: () => void;
}

interface Service {
    id: string;
    name: string;
    price: number;
    price_eur?: number;
    billing_type: string;
    description?: string;
}

export function CreateInvoiceDialog({ children, onSuccess }: CreateInvoiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
    const [projects, setProjects] = useState<Array<{ id: string; name: string; client_id: string }>>([])
    const [services, setServices] = useState<Service[]>([])
    const [selectedClientId, setSelectedClientId] = useState<string>("")
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_id: "",
            project_id: undefined,
            currency: 'CHF',
            description: "",
            due_date: "",
            items: [],
        },
    })

    const currency = form.watch('currency')
    const items = form.watch('items')

    // Filter projects by selected client
    const filteredProjects = useMemo(() => {
        if (!selectedClientId) return []
        return projects.filter(p => p.client_id === selectedClientId)
    }, [projects, selectedClientId])

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open])

    useEffect(() => {
        if (selectedClientId) {
            form.setValue('project_id', '')
        }
    }, [selectedClientId, form])

    async function fetchData() {
        const supabase = createClient()
        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, name')
            .order('name', { ascending: true })

        const { data: projectsData } = await supabase
            .from('projects')
            .select('id, name, client_id')
            .order('name', { ascending: true })

        const { data: servicesData } = await supabase
            .from('services')
            .select('id, name, price, price_eur, billing_type, description')
            .eq('active', true)
            .order('name', { ascending: true })

        if (clientsData) setClients(clientsData)
        if (projectsData) setProjects(projectsData)
        if (servicesData) setServices(servicesData)
    }

    const addServiceToInvoice = (service: Service) => {
        const currentItems = form.getValues('items') || []
        const price = currency === 'EUR' ? (service.price_eur || service.price) : service.price
        const unitLabel = service.billing_type === 'monthly' ? 'month' : 
                         service.billing_type === 'yearly' ? 'year' : 'unit'

        const newItems = [
            ...currentItems,
            {
                id: `service-${service.id}-${Date.now()}`,
                name: service.name,
                description: service.description || '',
                quantity: 1,
                price,
                unitLabel,
                service_id: service.id,
                type: 'service'
            }
        ]
        form.setValue('items', newItems, { shouldValidate: true })
    }

    const addCustomItem = () => {
        const currentItems = form.getValues('items') || []
        const newItems = [
            ...currentItems,
            {
                id: `custom-${Date.now()}`,
                name: '',
                description: '',
                quantity: 1,
                price: 0,
                unitLabel: 'unit',
                type: 'item'
            }
        ]
        form.setValue('items', newItems, { shouldValidate: true })
    }

    const removeItem = (itemId: string) => {
        const currentItems = form.getValues('items') || []
        const newItems = currentItems.filter(item => item.id !== itemId)
        form.setValue('items', newItems, { shouldValidate: true })
    }

    const updateItem = (itemId: string, field: string, value: any) => {
        const currentItems = form.getValues('items') || []
        const newItems = currentItems.map(item => 
            item.id === itemId ? { ...item, [field]: value } : item
        )
        form.setValue('items', newItems, { shouldValidate: true })
    }

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    }

    async function onSubmit(values: FormValues) {
        setIsLoading(true)

        const total = calculateTotal()
        if (total <= 0) {
            toast.error('Total amount must be greater than 0')
            setIsLoading(false)
            return
        }

        const formData = new FormData()
        formData.append('clientId', values.client_id)
        if (values.project_id && values.project_id !== "unassigned") {
            formData.append('projectId', values.project_id)
        }
        formData.append('amount', total.toString())
        formData.append('currency', values.currency)
        formData.append('description', values.description || `Invoice for ${clients.find(c => c.id === values.client_id)?.name}`)
        if (values.due_date) formData.append('dueDate', values.due_date)
        formData.append('items', JSON.stringify(values.items))

        const result = await createInvoiceAction(formData)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Invoice created successfully")
            setOpen(false)
            form.reset()
            setSelectedClientId("")
            router.refresh()
            if (onSuccess) onSuccess()
        }
        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Issue a payment request to a client.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="client_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client *</FormLabel>
                                        <Select 
                                            onValueChange={(value) => {
                                                field.onChange(value)
                                                setSelectedClientId(value)
                                            }} 
                                            value={field.value}
                                        >
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
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CHF">CHF</SelectItem>
                                                <SelectItem value="EUR">EUR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="project_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedClientId}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={selectedClientId ? "Select a project" : "Select client first"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="unassigned">None</SelectItem>
                                            {filteredProjects.map(project => (
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

                        <div className="grid gap-4 md:grid-cols-2">
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
                        </div>

                        {/* Line Items Section */}
                        <FormField
                            control={form.control}
                            name="items"
                            render={() => (
                                <FormItem>
                                    <div className="space-y-3">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <FormLabel>Invoice Items *</FormLabel>
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                                {services.length > 0 && (
                                                    <Select
                                                        onValueChange={(serviceId) => {
                                                            const service = services.find(s => s.id === serviceId)
                                                            if (service) addServiceToInvoice(service)
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full md:w-[180px]">
                                                            <SelectValue placeholder="Add Service" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {services.map(service => (
                                                                <SelectItem key={service.id} value={service.id}>
                                                                    {service.name} ({currency === 'EUR' ? (service.price_eur || service.price) : service.price} {currency})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <Button type="button" variant="outline" size="sm" onClick={addCustomItem} className="w-full md:w-auto">
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Custom Item
                                                </Button>
                                            </div>
                                        </div>

                                        {items.length === 0 ? (
                                            <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                                                No items added. Add services or custom items above.
                                            </div>
                                        ) : (
                                            <ScrollArea className="max-h-[260px] pr-2">
                                                <div className="space-y-2 border rounded-lg divide-y">
                                                    {items.map((item) => (
                                                        <div key={item.id} className="p-3 space-y-2">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 grid gap-2 md:grid-cols-2">
                                                                    <Input
                                                                        placeholder="Item name"
                                                                        value={item.name}
                                                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                                                        className="font-medium"
                                                                    />
                                                                    <Input
                                                                        placeholder="Description (optional)"
                                                                        value={item.description || ''}
                                                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                                                    />
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive"
                                                                    onClick={() => removeItem(item.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => updateItem(item.id, 'quantity', Math.max(0.01, item.quantity - 1))}
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        className="w-20 text-center"
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                                <span className="text-sm text-muted-foreground">×</span>
                                                                <Input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="w-28 text-right"
                                                                    placeholder="Price"
                                                                    value={item.price}
                                                                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                                />
                                                                <span className="ml-auto text-sm font-medium">
                                                                    {currency} {(item.quantity * item.price).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}

                                        {items.length > 0 && (
                                            <div className="flex justify-end pt-2 border-t">
                                                <div className="text-base font-semibold">
                                                    Total: {currency} {calculateTotal().toFixed(2)}
                                                </div>
                                            </div>
                                        )}
                                        </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setOpen(false)
                                    form.reset()
                                    setSelectedClientId("")
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || items.length === 0}>
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
