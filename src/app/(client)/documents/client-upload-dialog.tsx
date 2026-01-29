'use client'

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { uploadClientDocument } from "./actions"
import { CreateFolderDialog, type CreateFolderDialogRef } from "./create-folder-dialog"
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
import { Upload, Loader2, FileText, FolderPlus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"

export type ClientUploadDialogRef = { open: () => void }

interface ClientUploadDialogProps {
    clientId: string;
    projects: { id: string, name: string }[];
    /** When true, no trigger is rendered; use ref.current.open() to open. */
    externalTrigger?: boolean;
    /** Current folder to upload into */
    currentFolderId?: string | null;
}

export const ClientUploadDialog = forwardRef<ClientUploadDialogRef, ClientUploadDialogProps>(
    function ClientUploadDialog({ clientId, projects, externalTrigger, currentFolderId }, ref) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), [])
    const [file, setFile] = useState<File | null>(null)
    const [projectId, setProjectId] = useState<string>("")
    const [isUploading, setIsUploading] = useState(false)
    const router = useRouter()

    const handleUpload = async () => {
        if (!file) return

        try {
            setIsUploading(true)
            
            // Create FormData for server action
            const formData = new FormData()
            formData.append('file', file)
            formData.append('client_id', clientId)
            if (projectId && projectId !== 'no-project') {
                formData.append('project_id', projectId)
            }
            if (currentFolderId) {
                formData.append('folder_id', currentFolderId)
            }

            // Upload via server action (handles storage + database)
            await uploadClientDocument(formData)

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
            {!externalTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" aria-label={t.documents.upload.button}>
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.documents.upload.button}</span>
                    </Button>
                </DialogTrigger>
            )}
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
})

/** On small devices: sticky FAB bottom-right (same as requests). On md+: inline outline button (Nova Pasta style). */
export function DocumentsUploadWithFab({ clientId, projects, currentFolderId }: { 
    clientId: string; 
    projects: { id: string; name: string }[];
    currentFolderId?: string | null;
}) {
    const { t } = useLanguage()
    const dialogRef = useRef<ClientUploadDialogRef>(null)

    return (
        <>
            {/* Desktop: outline button same style as Nova Pasta */}
            <div className="hidden md:block shrink-0">
                <ClientUploadDialog clientId={clientId} projects={projects} currentFolderId={currentFolderId} />
            </div>
            {/* Mobile: sticky FAB bottom-right, same style as requests button */}
            <Button
                size="icon"
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl shadow-lg shadow-primary/25 md:hidden"
                aria-label={t.documents.upload.button}
                onClick={() => dialogRef.current?.open()}
            >
                <Upload className="h-6 w-6" />
            </Button>
            <ClientUploadDialog ref={dialogRef} clientId={clientId} projects={projects} currentFolderId={currentFolderId} externalTrigger />
        </>
    )
}

/** Desktop: outline buttons (Nova Pasta style). Mobile: two sticky FABs side by side (Create folder + Upload). */
export function DocumentsActionsWithFab({
    clientId,
    projects,
    currentFolderId,
}: {
    clientId: string;
    projects: { id: string; name: string }[];
    currentFolderId?: string | null;
}) {
    const { t } = useLanguage();
    const folderDialogRef = useRef<CreateFolderDialogRef>(null);
    const uploadDialogRef = useRef<ClientUploadDialogRef>(null);

    return (
        <>
            {/* Desktop: outline buttons, same style as Nova Pasta */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => folderDialogRef.current?.open()} aria-label={t.documents.newFolder || "New Folder"}>
                    <FolderPlus className="h-4 w-4" />
                    <span>{t.documents.newFolder || "New Folder"}</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => uploadDialogRef.current?.open()} aria-label={t.documents.upload.button}>
                    <Upload className="h-4 w-4" />
                    <span>{t.documents.upload.button}</span>
                </Button>
            </div>
            {/* Mobile: two sticky FABs side by side (same style as requests button) */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 md:hidden">
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/25"
                    aria-label={t.documents.newFolder || "New Folder"}
                    onClick={() => folderDialogRef.current?.open()}
                >
                    <FolderPlus className="h-6 w-6" />
                </Button>
                <Button
                    size="icon"
                    className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/25"
                    aria-label={t.documents.upload.button}
                    onClick={() => uploadDialogRef.current?.open()}
                >
                    <Upload className="h-6 w-6" />
                </Button>
            </div>
            {/* Single dialog instances, opened via ref */}
            <CreateFolderDialog ref={folderDialogRef} clientId={clientId} parentId={currentFolderId} externalTrigger />
            <ClientUploadDialog ref={uploadDialogRef} clientId={clientId} projects={projects} currentFolderId={currentFolderId} externalTrigger />
        </>
    );
}
