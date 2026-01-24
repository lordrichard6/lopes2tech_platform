import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export async function TeamList() {
    const supabase = await createClient();
    const adminSupabase = createAdminClient();

    // Fetch all profiles with role 'admin'
    const { data: admins } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('full_name');

    if (!admins) return <div>No admins found</div>;

    // Fetch emails for these admins
    const adminsWithEmail = await Promise.all(admins.map(async (admin) => {
        const { data: { user }, error } = await adminSupabase.auth.admin.getUserById(admin.id);
        return {
            ...admin,
            email: user?.email || 'No email found'
        };
    }));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-muted-foreground">Current Admins</h3>
                <Button variant="outline" size="sm" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Admin
                </Button>
            </div>

            <div className="grid gap-4">
                {adminsWithEmail.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={admin.avatar_url ? (admin.avatar_url.startsWith('http') ? admin.avatar_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${admin.avatar_url}`) : undefined} />
                                <AvatarFallback>{admin.full_name?.[0] || 'A'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{admin.full_name || 'Unnamed Admin'}</p>
                                <p className="text-sm text-muted-foreground">{admin.email}</p>
                            </div>
                        </div>
                        <Badge variant="secondary">Super Admin</Badge>
                    </div>
                ))}
            </div>
        </div>
    )
}
