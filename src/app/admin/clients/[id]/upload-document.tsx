'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { addDocumentRecord } from "./actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Upload, Loader2, FileText } from "lucide-react"

export function UploadDocument({ clientId }: { clientId: string }) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async () => {
        if (!file) return

        try {
            setIsUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('client-documents')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Add Database Record
            await addDocumentRecord({
                client_id: clientId,
                name: file.name,
                file_path: fileName,
                size: file.size,
                type: file.type || 'application/octet-stream',
                is_visible_to_client: isVisible
            })

            setOpen(false)
            setFile(null)
            setIsVisible(false)
            router.refresh()

        } catch (error) {
            console.error('Upload failed:', error)
            alert('Upload failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a file for this client. You can control visibility below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                            File
                        </Label>
                        <Input
                            id="file"
                            type="file"
                            className="col-span-3 cursor-pointer"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="visibility"
                                checked={isVisible}
                                onCheckedChange={setIsVisible}
                            />
                            <Label htmlFor="visibility">Visible to Client</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
