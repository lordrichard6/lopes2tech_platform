'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addServiceToProjectAction } from "./actions";
import { createClient } from "@/lib/supabase/client";

interface Service {
    id: string;
    name: string;
    price: number;
    billing_type: string;
}

interface AddServiceDialogProps {
    projectId: string;
    linkedServiceIds: string[];
}

export function AddServiceDialog({ projectId, linkedServiceIds }: AddServiceDialogProps) {
    const [open, setOpen] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    // Fetch available services when popover opens
    useEffect(() => {
        if (open && services.length === 0) {
            setLoading(true);
            const supabase = createClient();
            supabase
                .from('services')
                .select('id, name, price, billing_type')
                .eq('active', true)
                .order('name')
                .then(({ data, error }) => {
                    if (error) {
                        toast.error('Failed to load services');
                    } else {
                        setServices(data || []);
                    }
                    setLoading(false);
                });
        }
    }, [open, services.length]);

    // Filter out already linked services
    const availableServices = services.filter(s => !linkedServiceIds.includes(s.id));

    const handleAddService = async (serviceId: string) => {
        if (!serviceId) return;
        setAdding(true);
        const result = await addServiceToProjectAction(projectId, serviceId);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success('Service added to project');
            setOpen(false);
        }
        setAdding(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 px-2">
                    <Plus className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="end">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Add Service</p>
                    {loading ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : availableServices.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                            {services.length === 0 
                                ? "No active services available." 
                                : "All services already linked."}
                        </p>
                    ) : (
                        <Select onValueChange={handleAddService} disabled={adding}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={adding ? "Adding..." : "Select a service"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableServices.map((service) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        <div className="flex items-center justify-between w-full gap-2">
                                            <span>{service.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                CHF {service.price}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
