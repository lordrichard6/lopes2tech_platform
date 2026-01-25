
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function sendNotification({
    userId,
    type,
    title,
    message,
    link,
}: {
    userId: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
}) {
    // Use Admin Client to bypass RLS for sending notifications
    const supabase = createAdminClient();

    try {
        const { error } = await supabase.from("notifications").insert({
            user_id: userId,
            type,
            title,
            message,
            link,
        });

        if (error) {
            console.error("Failed to send notification:", error);
            return { error: "Failed to send notification" };
        }

        // We can't easily revalidate path for a SPECIFIC user without knowing their current path.
        // But since we use Realtime or client-side fetching in the Bell, strictly revalidating might not be critical 
        // if the UI is reactive.
        // However, if we want server rendered headers to update, we'd need revalidatePath.
        // For now, return success.
        return { success: true };
    } catch (error) {
        console.error("Error sending notification:", error);
        return { error: "Internal error" };
    }
}

export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notificationId);

        if (error) throw error;

        revalidatePath('/', 'layout'); // Refresh layout to update bell count
        return { success: true };
    } catch (error) {
        console.error("Error marking notification read:", error);
        return { error: "Failed to update notification" };
    }
}

export async function markAllNotificationsAsRead() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    try {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", user.id)
            .eq("is_read", false);

        if (error) throw error;

        revalidatePath('/', 'layout');
        return { success: true };
    } catch (error) {
        console.error("Error marking all read:", error);
        return { error: "Failed to update notifications" };
    }
}
