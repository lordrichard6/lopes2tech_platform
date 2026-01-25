'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { updateNotificationSettings } from "./actions"

interface NotificationSettingsProps {
    settings: {
        notify_project_updates: boolean
        notify_invoice_reminders: boolean
        notify_new_documents: boolean
    }
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        notify_project_updates: settings.notify_project_updates ?? true,
        notify_invoice_reminders: settings.notify_invoice_reminders ?? true,
        notify_new_documents: settings.notify_new_documents ?? true
    })

    const handleToggle = (field: string, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setSaving(true)
        const result = await updateNotificationSettings(formData)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Notification preferences saved!')
        }
        setSaving(false)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Project Updates</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive emails when project milestones change
                        </p>
                    </div>
                    <Switch
                        checked={formData.notify_project_updates}
                        onCheckedChange={(checked) => handleToggle('notify_project_updates', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Invoice Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive payment due reminders
                        </p>
                    </div>
                    <Switch
                        checked={formData.notify_invoice_reminders}
                        onCheckedChange={(checked) => handleToggle('notify_invoice_reminders', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>New Documents</Label>
                        <p className="text-sm text-muted-foreground">
                            Receive emails when new documents are shared
                        </p>
                    </div>
                    <Switch
                        checked={formData.notify_new_documents}
                        onCheckedChange={(checked) => handleToggle('notify_new_documents', checked)}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={saving} size="sm" className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
    )
}
