import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClientSidebar } from "@/components/layout/client-sidebar";
import { ClientHeader } from "@/components/layout/client-header";
import { LanguageProvider } from "@/contexts/language-context";

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
                <div className="flex-1 flex flex-col pl-0 md:pl-16 transition-all duration-300">
                    <ClientHeader
                        email={user.email || ''}
                        avatarUrl={avatarUrl}
                        clientName={clientName}
                    />
                    <main className="flex-1 container py-6 mx-auto px-4 sm:px-6 lg:px-8">
                        {children}
                    </main>
                </div>
            </div>
        </LanguageProvider>
    );
}
