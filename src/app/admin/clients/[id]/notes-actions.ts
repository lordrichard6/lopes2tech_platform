'use server'

import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addNoteSchema = z.object({
    client_id: z.string().uuid(),
    type: z.enum(['note', 'call', 'meeting', 'email']).default('note'),
    title: z.string().min(1, "Title is required").max(200),
    content: z.string().max(5000).optional(),
});

export async function addNote(data: {
    client_id: string;
    type: 'note' | 'call' | 'meeting' | 'email';
    title: string;
    content?: string;
}) {
    const { supabase, user } = await requireAdmin();

    const validated = addNoteSchema.safeParse(data);
    if (!validated.success) {
        throw new Error(validated.error.issues[0].message);
    }

    const { error } = await supabase
        .from('notes')
        .insert({
            ...validated.data,
            created_by: user.id
        });

    if (error) throw new Error(error.message);
    revalidatePath(`/admin/clients/${data.client_id}`);
}

export async function updateNote(id: string, data: {
    title?: string;
    content?: string;
    type?: 'note' | 'call' | 'meeting' | 'email';
}) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('notes')
        .update(data)
        .eq('id', id);

    if (error) throw new Error(error.message);
}

export async function deleteNote(id: string, clientId: string) {
    const { supabase } = await requireAdmin();

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    revalidatePath(`/admin/clients/${clientId}`);
}
