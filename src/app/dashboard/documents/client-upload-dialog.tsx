'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { addClientDocumentRecord } from "./actions"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Upload, Loader2, FileText, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"

interface ClientUploadDialogProps {
    clientId: string;
    projects: { id: string, name: string }[];
}

export function ClientUploadDialog({ clientId, projects }: ClientUploadDialogProps) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [projectId, setProjectId] = useState<string>("")
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async () => {
        if (!file) return

        try {
            setIsUploading(true)
            const fileExt = file.name.split('.').pop()
            // Path convention: client_id/timestamp-random.ext
            const fileName = `${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('client-documents')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            // 2. Add Database Record
            await addClientDocumentRecord({
                client_id: clientId,
                name: file.name,
                file_path: fileName,
                size: file.size,
                type: file.type || 'application/octet-stream',
                project_id: projectId || undefined
            })

            toast.success(t.documents.upload.success)
            setOpen(false)
            setFile(null)
            setProjectId("")
            router.refresh()

        } catch (error) {
            console.error('Upload failed:', error)
            toast.error(t.common.error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    {t.documents.upload.button}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t.documents.upload.title}</DialogTitle>
                    <DialogDescription>
                        {t.documents.upload.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Drag & Drop / File Input Area */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">{t.documents.title}</Label>
                        <div className="relative border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer">
                            <Input
                                id="file"
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <FileText className="h-8 w-8 text-primary mb-2" />
                                    <span className="text-sm font-medium break-all">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Upload className="h-8 w-8 mb-2" />
                                    <span className="text-sm text-center">{t.documents.upload.dragDrop}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Project Selector */}
                    {projects.length > 0 && (
                        <div className="grid gap-2">
                            <Label>{t.sidebar.projects}</Label>
                            <Select value={projectId} onValueChange={setProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t.documents.upload.selectProject} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="no-project">
                                        <span className="text-muted-foreground">{t.documents.upload.selectProject}</span>
                                    </SelectItem>
                                    {projects.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t.documents.upload.uploading}
                            </>
                        ) : (
                            t.documents.upload.button
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
