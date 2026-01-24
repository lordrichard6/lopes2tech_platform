import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { DashboardUserMenu } from "@/components/layout/dashboard-user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageProvider } from "@/contexts/language-context";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function DashboardLayout({
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

    // Fetch Profile for Avatar
    const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

    // Fetch Client Name
    const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('profile_id', user.id)
        .single();

    let avatarUrl = '';
    if (profile?.avatar_url) {
        if (profile.avatar_url.startsWith('http')) {
            avatarUrl = profile.avatar_url;
        } else {
            const { data } = supabase.storage.from('avatars').getPublicUrl(profile.avatar_url);
            avatarUrl = data.publicUrl;
        }
    }

    const clientName = client?.name || user.email?.split('@')[0] || 'User';

    return (
        <LanguageProvider>
            <div className="flex min-h-screen">
                <ClientSidebar />
                <div className="flex-1 flex flex-col pl-16 transition-all duration-300">
                    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="container flex h-14 items-center justify-end px-4">
                            <div className="flex items-center gap-3">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <DashboardUserMenu
                                    email={user.email || ''}
                                    avatarUrl={avatarUrl}
                                    clientName={clientName}
                                />
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 container py-6 mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </LanguageProvider>
    );
}
