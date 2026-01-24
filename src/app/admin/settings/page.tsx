import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminProfileForm } from "./admin-profile-form"
import { AdminPasswordForm } from "./password-form"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { revalidatePath } from "next/cache"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceDefaultsForm } from "./invoice-defaults-form"
import { NotificationSettingsForm } from "./notification-settings-form"
import { SystemConfigForm } from "./system-config-form"
import { TeamList } from "./team-list"

export default async function AdminSettingsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard')
    }

    // Fetch System Settings
    const { data: systemSettings } = await supabase
        .from('system_settings')
        .select('*')
        .single()

    async function handleAvatarUpdate(newUrl: string) {
        'use server'
        revalidatePath('/admin/settings')
        revalidatePath('/admin')
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile & Security</TabsTrigger>
                    <TabsTrigger value="business">Business Defaults</TabsTrigger>
                    <TabsTrigger value="system">System & Team</TabsTrigger>
                </TabsList>

                {/* Profile & Security Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile</CardTitle>
                            <CardDescription>
                                Manage your public profile information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col gap-6 md:flex-row md:items-start">
                                <div className="space-y-2">
                                    <div className="font-medium text-sm">Avatar</div>
                                    <AvatarUpload
                                        uid={user.id}
                                        url={profile.avatar_url}
                                        size="lg"
                                        onUploadComplete={handleAvatarUpdate}
                                    />
                                </div>
                                <div className="flex-1 max-w-xl">
                                    <AdminProfileForm profile={profile} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>
                                Update your password and manage account security.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminPasswordForm />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Business Defaults Tab */}
                <TabsContent value="business" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice & Proposal Defaults</CardTitle>
                            <CardDescription>
                                Set default values for new invoices and proposals to speed up your workflow.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InvoiceDefaultsForm settings={systemSettings || {}} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System & Team Tab */}
                <TabsContent value="system" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Management</CardTitle>
                                <CardDescription>
                                    View and manage admin access.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TeamList />
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>
                                        Control what alerts you receive.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <NotificationSettingsForm settings={systemSettings || {}} />
                                </CardContent>
                            </Card>

                            <Card className="border-red-200 dark:border-red-900/50">
                                <CardHeader>
                                    <CardTitle className="text-red-500">System Configuration</CardTitle>
                                    <CardDescription>
                                        Global system controls. Handle with care.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SystemConfigForm settings={systemSettings || {}} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
