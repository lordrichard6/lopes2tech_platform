'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Folder, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "sonner"
import { renameFolder, deleteFolder, moveDocumentToFolder } from "./actions"
import { useRouter } from "next/navigation"

interface FolderGridItemProps {
    folder: {
        id: string;
        name: string;
        created_at: string;
    };
}

export function FolderGridItem({ folder }: FolderGridItemProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [renameOpen, setRenameOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [newName, setNewName] = useState(folder.name)
    const [isLoading, setIsLoading] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
        
        const type = e.dataTransfer.getData('type')
        const documentId = e.dataTransfer.getData('documentId')
        
        if (type === 'document' && documentId) {
            try {
                await moveDocumentToFolder(documentId, folder.id)
                toast.success(t.documents.documentMoved || 'Document moved')
                router.refresh()
            } catch (error) {
                console.error('Error moving document:', error)
                toast.error(t.common.error)
            }
        }
    }

    const handleRename = async () => {
        if (!newName.trim() || newName === folder.name) {
            setRenameOpen(false)
            return
        }

        try {
            setIsLoading(true)
            await renameFolder(folder.id, newName.trim())
            toast.success(t.documents.folderRenamed || 'Folder renamed')
            setRenameOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error renaming folder:', error)
            toast.error(t.common.error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setIsLoading(true)
            await deleteFolder(folder.id)
            toast.success(t.documents.folderDeleted || 'Folder deleted')
            setDeleteOpen(false)
            router.refresh()
        } catch (error) {
            console.error('Error deleting folder:', error)
            toast.error(t.common.error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <Card 
                className={`group relative overflow-hidden hover:shadow transition-all max-w-[100px] sm:max-w-[110px] ${isDragOver ? 'border-primary border-2 bg-primary/5 scale-[1.02]' : 'hover:border-primary/30'}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Link href={`/documents?folder=${folder.id}`} className="block">
                    <CardContent className="p-1.5 flex flex-col items-center text-center min-h-0">
                        <div className={`p-1.5 rounded-md mb-1 flex-shrink-0 transition-colors ${isDragOver ? 'bg-primary/20' : 'bg-primary/10'}`}>
                            <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-[10px] font-medium truncate w-full leading-tight" title={folder.name}>
                            {folder.name}
                        </span>
                    </CardContent>
                </Link>
                
                {/* Actions dropdown */}
                <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/90 backdrop-blur-sm border border-border/50" onClick={(e) => e.preventDefault()}>
                                <MoreVertical className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t.common.rename || 'Rename'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => setDeleteOpen(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.common.delete}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>

            {/* Rename Dialog */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{t.common.rename || 'Rename'}</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleRename} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>{t.documents.deleteFolder || 'Delete Folder'}</DialogTitle>
                        <DialogDescription>
                            {t.documents.deleteFolderDesc || 'Are you sure? Documents inside will be moved to the root folder.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.common.delete}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
