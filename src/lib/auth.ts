import { createClient } from "@/lib/supabase/server";

/**
 * Ensures the current request is from an authenticated admin user.
 * Throws an error if not authenticated or not an admin.
 * Use at the start of every admin server action.
 */
export async function requireAdmin() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("Unauthorized: Please log in.");
    }

    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || profile.role !== "admin") {
        throw new Error("Forbidden: Admin access required.");
    }

    return { user, supabase };
}

/**
 * Ensures the current request is from an authenticated user.
 * Returns the user and supabase client.
 */
export async function requireAuth() {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error("Unauthorized: Please log in.");
    }

    return { user, supabase };
}
