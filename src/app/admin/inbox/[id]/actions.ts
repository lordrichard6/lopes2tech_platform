'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function sendQuoteAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string
    const amount = formData.get('amount') as string
    const currency = formData.get('currency') as string

    if (!taskId || !amount) {
        redirect(`/admin/inbox/${taskId}?error=Amount required`)
    }

    const { error } = await supabase
        .from('tasks')
        .update({
            status: 'quoted',
            quote_amount: parseFloat(amount),
            quote_currency: currency || 'CHF'
        })
        .eq('id', taskId)

    if (error) {
        redirect(`/admin/inbox/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/admin/inbox/${taskId}`)
    revalidatePath(`/admin/inbox`)
    redirect('/admin/inbox')
}

export async function rejectRequestAction(formData: FormData) {
    const supabase = await createClient()

    const taskId = formData.get('taskId') as string

    if (!taskId) return

    const { error } = await supabase
        .from('tasks')
        .update({ status: 'rejected' })
        .eq('id', taskId)

    if (error) {
        redirect(`/admin/inbox/${taskId}?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath(`/admin/inbox/${taskId}`)
    revalidatePath(`/admin/inbox`)
    redirect('/admin/inbox')
}

export async function deleteTaskAction(formData: FormData) {
    "use server";
    const createAdminClient = (await import("@/lib/supabase/admin")).createAdminClient;
    const taskId = formData.get("taskId") as string;
    
    if (!taskId) {
        redirect("/admin/inbox?error=Task ID required");
    }

    const supabase = createAdminClient();

    // Verify task exists before deleting
    const { data: task, error: fetchError } = await supabase
        .from("tasks")
        .select("id, requester_id")
        .eq("id", taskId)
        .single();

    if (fetchError || !task) {
        console.error("Task not found:", fetchError);
        redirect("/admin/inbox?error=Task not found");
    }

    // Delete the task
    const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

    if (deleteError) {
        console.error("Error deleting task:", deleteError);
        redirect(`/admin/inbox?error=${encodeURIComponent(deleteError.message)}`);
    }

    // Revalidate both admin and client views
    revalidatePath("/admin/inbox");
    revalidatePath("/requests"); // Client requests page
    revalidatePath("/requests/[id]", "page"); // Client request detail pages
    
    redirect("/admin/inbox");
}

export async function createProjectFromTaskAction(formData: FormData) {
    const createAdminClient = (await import("@/lib/supabase/admin")).createAdminClient;
    const supabase = createAdminClient();

    const taskId = formData.get("taskId") as string;
    if (!taskId) {
        redirect("/admin/inbox?error=Task ID required");
    }

    // Fetch task with client info
    const { data: task, error: taskError } = await supabase
        .from("tasks")
        .select(`
            *,
            profiles!requester_id (
                id,
                clients (
                    id
                )
            )
        `)
        .eq("id", taskId)
        .single();

    if (taskError || !task) {
        redirect("/admin/inbox?error=Task not found");
    }

    const profile = task.profiles as any;
    const clientId = profile?.clients?.[0]?.id;

    if (!clientId) {
        redirect("/admin/inbox?error=Client not found for this task");
    }

    // Create project from task
    const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
            client_id: clientId,
            name: task.title,
            description: task.description || null,
            budget: task.quote_amount || null,
            status: "active",
            progress: 0,
            start_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

    if (projectError) {
        redirect(`/admin/inbox?error=${encodeURIComponent(projectError.message)}`);
    }

    // Link task to project
    const { error: linkError } = await supabase
        .from("tasks")
        .update({ project_id: project.id })
        .eq("id", taskId);

    if (linkError) {
        console.error("Failed to link task to project:", linkError);
    }

    // Log activity
    const { logActivity } = await import("@/lib/activity");
    const { data: { user } } = await supabase.auth.getUser();
    await logActivity({
        userId: user?.id,
        action: "create_project_from_task",
        entityType: "project",
        entityId: project.id,
        metadata: {
            taskId,
            taskTitle: task.title,
            clientId,
        },
    });

    revalidatePath("/admin/inbox");
    revalidatePath(`/admin/projects/${project.id}`);
    redirect(`/admin/projects/${project.id}`);
}
