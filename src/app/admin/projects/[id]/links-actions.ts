'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createLinkAction(formData: FormData) {
    const supabase = await createClient();

    const projectId = formData.get('projectId') as string;
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const description = formData.get('description') as string;
    const icon = formData.get('icon') as string;

    if (!projectId || !name || !url || !icon) {
        return { error: "Missing required fields" };
    }

    try {
        const { error } = await supabase
            .from('project_links')
            .insert({
                project_id: projectId,
                name,
                url,
                description,
                icon
            });

        if (error) throw error;

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteLinkAction(formData: FormData) {
    const supabase = await createClient();
    const linkId = formData.get('linkId') as string;
    const projectId = formData.get('projectId') as string;

    try {
        const { error } = await supabase
            .from('project_links')
            .delete()
            .eq('id', linkId);

        if (error) throw error;

        revalidatePath(`/admin/projects/${projectId}`);
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
