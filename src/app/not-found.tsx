
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
    const supabase = await createClient();

    // Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser();

    // If logged in, we verify role to provide better context, but we DO NOT redirect automatically
    // to avoid loops if the user is 404ing on a protected route.
    const isClient = user && user.user_metadata?.role !== 'admin';
    const isAdmin = user && user.user_metadata?.role === 'admin';

    // If not logged in, show standard 404
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
            <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
                The page you are looking for does not exist.
            </p>
            <Button asChild>
                <Link href={isAdmin ? "/admin" : (isClient ? "/dashboard" : "/login")}>
                    {isAdmin ? "Go to Admin Dashboard" : (isClient ? "Go to Dashboard" : "Go to Login")}
                </Link>
            </Button>
        </div>
    );
}
