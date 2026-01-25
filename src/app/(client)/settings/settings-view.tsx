'use client';

import { useLanguage } from "@/contexts/language-context";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ProfileForm } from "./profile-form";
import { BillingAddress } from "./billing-address";
import { PasswordForm } from "./password-form";
// import { revalidatePath } from "next/cache"; // Removed

// careful: revalidatePath is server-only. 
// The handleAvatarUpdate function must be passed from the server page or defined as a server action in a separate file.
// The props handled this in the original page.

interface SettingsViewProps {
    user: any;
    avatarUrl: string;
    profile: any;
    onAvatarUpdate: (url: string) => Promise<void>;
}

export function SettingsView({ user, avatarUrl, profile, onAvatarUpdate }: SettingsViewProps) {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t.settings.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {t.settings.description}
                </p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.profileInformation}</CardTitle>
                    <CardDescription>
                        {t.settings.profileDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                        <div className="flex-shrink-0">
                            <AvatarUpload
                                uid={user?.id || ''}
                                url={avatarUrl}
                                onUploadComplete={onAvatarUpdate}
                                size="lg"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <ProfileForm profile={profile} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Billing Address */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.billingAddress}</CardTitle>
                    <CardDescription>
                        {t.settings.billingDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BillingAddress
                        billingAddress={{
                            billing_street_address: profile.billing_street_address,
                            billing_city: profile.billing_city,
                            billing_postal_code: profile.billing_postal_code,
                            billing_country: profile.billing_country
                        }}
                        mainAddress={{
                            street_address: profile.street_address,
                            city: profile.city,
                            postal_code: profile.postal_code,
                            country: profile.country
                        }}
                    />
                </CardContent>
            </Card>

            {/* Security */}
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.security}</CardTitle>
                    <CardDescription>
                        {t.settings.securityDescription}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PasswordForm />
                </CardContent>
            </Card>
        </div>
    );
}
