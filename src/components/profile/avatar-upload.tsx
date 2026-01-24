'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
    uid: string
    url: string | null
    onUploadComplete: (url: string) => void
    editable?: boolean
    size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-28 w-28'
}

export function AvatarUpload({ uid, url, onUploadComplete, editable = true, size = 'md' }: AvatarUploadProps) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (url) downloadImage(url)
    }, [url])

    async function downloadImage(path: string) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path)
            if (error) {
            }
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }

    // Helper to get effective URL
    const getEffectiveUrl = (pathOrUrl: string | null) => {
        if (!pathOrUrl) return null;
        if (pathOrUrl.startsWith('http')) return pathOrUrl;

        const { data } = supabase.storage.from('avatars').getPublicUrl(pathOrUrl);
        return data.publicUrl;
    }

    const effectiveUrl = getEffectiveUrl(url)

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            console.log("Starting upload...")
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                console.log("No file selected")
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            console.log("File selected:", file.name, file.size)

            // File Size Validation (Max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                throw new Error('Image must be smaller than 2MB.')
            }

            // Optimistic Update: Show preview immediately
            const objectUrl = URL.createObjectURL(file)
            setAvatarUrl(objectUrl) // Temporarily set to blob URL

            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: filePath, updated_at: new Date().toISOString() })
                .eq('id', uid)

            if (updateError) {
                throw updateError
            }

            onUploadComplete(filePath)
            toast.success('Avatar updated successfully!')

        } catch (error: any) {
            console.error("Upload failed details:", error)
            toast.error(error.message || 'Error uploading avatar')
            // Revert optimistic update if failed
            setAvatarUrl(url)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <Avatar className={`${sizeClasses[size]} ring-4 ring-background shadow-lg`}>
                <AvatarImage src={avatarUrl && avatarUrl.startsWith('blob:') ? avatarUrl : (effectiveUrl || '')} alt="Avatar" className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    U
                </AvatarFallback>
            </Avatar>

            {editable && (
                <div className="flex flex-col items-center gap-1">
                    <Label
                        htmlFor="avatar-upload"
                        className={`cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <div className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-md transition-colors text-xs font-medium">
                            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            {uploading ? 'Uploading...' : 'Change Photo'}
                        </div>
                    </Label>
                    <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={uploadAvatar}
                        disabled={uploading}
                    />
                    <p className="text-[10px] text-muted-foreground text-center">
                        Max 2MB
                    </p>
                </div>
            )}
        </div>
    )
}
