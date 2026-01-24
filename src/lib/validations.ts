import { z } from 'zod';

// ============================================
// Client Schemas
// ============================================
export const createClientSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
});

// ============================================
// Service Schemas
// ============================================
export const createServiceSchema = z.object({
    // Primary fields (backwards compatibility + default view)
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(2000).optional(),
    price: z.number().min(0, "Price must be positive"), // Represents price_chf

    // Multi-language names
    name_en: z.string().max(100).optional(),
    name_pt: z.string().max(100).optional(),
    name_de: z.string().max(100).optional(),

    // Multi-language descriptions
    description_en: z.string().max(2000).optional(),
    description_pt: z.string().max(2000).optional(),
    description_de: z.string().max(2000).optional(),

    // Dual pricing
    price_eur: z.number().min(0).default(0),

    billing_type: z.enum(['one_time', 'monthly', 'yearly']),
    active: z.boolean().default(true),

    // Stripe Integration
    stripe_product_id: z.string().optional(),
    stripe_price_id: z.string().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ============================================
// Project Schemas
// ============================================
export const createProjectSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(1000).optional(),
    clientId: z.string().uuid("Invalid client ID"),
    service_ids: z.array(z.string().uuid()).optional(),
});

// ============================================
// Subscription Schemas
// ============================================
export const createSubscriptionSchema = z.object({
    client_id: z.string().uuid("Invalid client ID"),
    service_id: z.string().uuid("Invalid service ID"),
    amount: z.number().min(0),
    start_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

// ============================================
// Credential Schemas
// ============================================
export const addCredentialSchema = z.object({
    client_id: z.string().uuid("Invalid client ID"),
    service_name: z.string().min(1, "Service name is required").max(100),
    url: z.string().url("Invalid URL").optional().or(z.literal('')),
    username: z.string().max(100).optional(),
    password: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
});

// ============================================
// Document Schemas
// ============================================
export const addDocumentSchema = z.object({
    client_id: z.string().uuid("Invalid client ID"),
    name: z.string().min(1, "Name is required").max(255),
    file_path: z.string().min(1),
    size: z.number().min(0),
    type: z.string().min(1),
    is_visible_to_client: z.boolean().default(false),
});

// ============================================
// Type exports
// ============================================
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type AddCredentialInput = z.infer<typeof addCredentialSchema>;
export type AddDocumentInput = z.infer<typeof addDocumentSchema>;
