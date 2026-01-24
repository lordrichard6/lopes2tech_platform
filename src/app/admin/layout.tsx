import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminUserMenu } from "@/components/layout/admin-user-menu";
import { ModeToggle } from "@/components/mode-toggle";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check if user is admin
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, avatar_url")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        redirect("/dashboard");
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <div className="flex-1 flex flex-col pl-16 transition-all duration-300">
                <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div /> {/* Spacer for flex-between or add Breadcrumbs later */}
                        <div className="flex items-center gap-4">
                            <ModeToggle />
                            <AdminUserMenu email={user.email || ''} avatarUrl={profile.avatar_url} />
                        </div>
                    </div>
                </header>
                <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
