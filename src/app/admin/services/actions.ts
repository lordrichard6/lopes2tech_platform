'use server'

import { requireAdmin } from "@/lib/auth";
import { createServiceSchema, updateServiceSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createService(data: {
    name: string;
    description?: string;
    price: number;
    // New fields
    name_en?: string;
    name_pt?: string;
    name_de?: string;
    description_en?: string;
    description_pt?: string;
    description_de?: string;
    price_eur?: number;
    billing_type: 'one_time' | 'monthly' | 'yearly';
    active: boolean;
    stripe_product_id?: string;
    stripe_price_id?: string;
}) {
    const { supabase } = await requireAdmin();

    const validated = createServiceSchema.safeParse(data);
    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    const { error } = await supabase
        .from('services')
        .insert(validated.data);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/services');
}

export async function updateService(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    // New fields
    name_en: string;
    name_pt: string;
    name_de: string;
    description_en: string;
    description_pt: string;
    description_de: string;
    price_eur: number;
    billing_type: 'one_time' | 'monthly' | 'yearly';
    active: boolean;
    stripe_product_id: string;
    stripe_price_id: string;
}>) {
    const { supabase } = await requireAdmin();

    const validated = updateServiceSchema.safeParse(data);
    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    const { error } = await supabase
        .from('services')
        .update(validated.data)
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/services');
}

export async function deleteService(id: string) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/services');
}

export async function bulkCreateServices(services: any[]) {
    const { supabase } = await requireAdmin();

    // Validate all services first
    const validatedServices = services.map(service => {
        // Ensure numeric fields are numbers
        const prepared = {
            ...service,
            price: Number(service.price) || 0,
            price_eur: Number(service.price_eur) || 0,
        };

        const validated = createServiceSchema.safeParse(prepared);
        if (!validated.success) {
            throw new Error(`Validation error for service "${service.name}": ${validated.error.issues[0].message}`);
        }
        return validated.data;
    });

    const { error } = await supabase
        .from('services')
        .insert(validatedServices);

    if (error) throw new Error(error.message);
    revalidatePath('/admin/services');
}

export async function replaceAllServices(services: any[]) {
    const { supabase } = await requireAdmin();

    // 1. Validate all services first
    const validatedServices = services.map(service => {
        const prepared = {
            ...service,
            price: Number(service.price) || 0,
            price_eur: Number(service.price_eur) || 0,
        };
        const validated = createServiceSchema.safeParse(prepared);
        if (!validated.success) {
            throw new Error(`Validation error for service "${service.name}": ${validated.error.issues[0].message}`);
        }
        return validated.data;
    });

    // 2. Delete all existing services
    const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
        if (deleteError.code === '23503') { // Foreign key violation
            throw new Error("Cannot replace services: Some services are currently being used by Projects or Subscriptions.");
        }
        throw new Error(`Failed to clear services: ${deleteError.message}`);
    }

    // 3. Insert new services
    const { error: insertError } = await supabase
        .from('services')
        .insert(validatedServices);

    if (insertError) throw new Error(insertError.message);
    revalidatePath('/admin/services');
}

