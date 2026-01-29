'use client'

import { useState, forwardRef, useImperativeHandle } from "react"
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
import { FolderPlus, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { createFolder } from "./actions"
import { useRouter } from "next/navigation"

export type CreateFolderDialogRef = { open: () => void }

interface CreateFolderDialogProps {
    clientId: string;
    parentId: string | null;
    /** When true, no trigger is rendered; use ref.current.open() to open. */
    externalTrigger?: boolean;
}

export const CreateFolderDialog = forwardRef<CreateFolderDialogRef, CreateFolderDialogProps>(
    function CreateFolderDialog({ clientId, parentId, externalTrigger }, ref) {
    const { t } = useLanguage()
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    useImperativeHandle(ref, () => ({ open: () => setOpen(true) }), [])

    const handleCreate = async () => {
        if (!name.trim()) return

        try {
            setIsCreating(true)
            await createFolder({
                client_id: clientId,
                name: name.trim(),
                parent_id: parentId,
            })
            toast.success(t.documents.folderCreated || 'Folder created')
            setOpen(false)
            setName("")
            router.refresh()
        } catch (error) {
            console.error('Error creating folder:', error)
            toast.error(t.common.error)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!externalTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                        <FolderPlus className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.documents.newFolder || 'New Folder'}</span>
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>{t.documents.newFolder || 'New Folder'}</DialogTitle>
                    <DialogDescription>
                        {t.documents.newFolderDesc || 'Create a new folder to organize your documents.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="folder-name">{t.documents.folderName || 'Folder name'}</Label>
                    <Input
                        id="folder-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.documents.folderNamePlaceholder || 'My Folder'}
                        className="mt-2"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && name.trim()) {
                                handleCreate()
                            }
                        }}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        {t.common.cancel}
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
                        {isCreating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            t.common.create || 'Create'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
})
