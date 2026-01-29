'use client'

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, Image, File, MoreVertical, FolderInput, Home, ExternalLink } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { moveDocumentToFolder } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getFileIcon(type: string, size: 'xs' | 'sm' = 'sm') {
    const c = size === 'xs' ? 'h-5 w-5' : 'h-6 w-6'
    if (type.includes('image')) return <Image className={`${c} text-blue-500`} />
    if (type.includes('pdf')) return <FileText className={`${c} text-red-500`} />
    return <File className={`${c} text-slate-400`} />
}

interface DocumentGridItemProps {
    doc: {
        id: string;
        name: string;
        type: string;
        size: number;
        created_at: string;
        downloadUrl: string;
        folder_id?: string | null;
    };
    locale: string;
    downloadLabel: string;
    folders?: { id: string; name: string }[];
}

export function DocumentGridItem({ doc, locale, downloadLabel, folders = [] }: DocumentGridItemProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const dateLocale = locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH'

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('documentId', doc.id)
        e.dataTransfer.setData('type', 'document')
        e.dataTransfer.effectAllowed = 'move'
        setIsDragging(true)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
    }

    const handleMoveToFolder = async (folderId: string | null) => {
        try {
            await moveDocumentToFolder(doc.id, folderId)
            toast.success(t.documents.documentMoved || 'Document moved')
            router.refresh()
        } catch (error) {
            console.error('Error moving document:', error)
            toast.error(t.common.error)
        }
    }
    
    return (
        <Card 
            className={`group relative overflow-hidden hover:shadow transition-all hover:border-primary/30 cursor-grab active:cursor-grabbing max-w-[100px] sm:max-w-[110px] ${isDragging ? 'opacity-50 scale-95' : ''}`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <CardContent className="p-1.5 flex flex-col items-center text-center min-h-0">
                <div className="bg-muted/80 p-1.5 rounded-md mb-1 flex-shrink-0">
                    {getFileIcon(doc.type, 'xs')}
                </div>
                <span className="text-[10px] font-medium truncate w-full leading-tight" title={doc.name}>
                    {doc.name}
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
                    {formatBytes(doc.size)}
                </span>
            </CardContent>

            {/* Three-dots menu: Download, Open, Move to */}
            <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 bg-background/90 backdrop-blur-sm border border-border/50">
                            <MoreVertical className="h-3 w-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                <Download className="h-4 w-4 mr-2" />
                                {downloadLabel}
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex items-center cursor-pointer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                {t.documents.openInNewTab || 'Open in new tab'}
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <FolderInput className="h-4 w-4 mr-2" />
                                {t.documents.moveTo || 'Move to...'}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    {doc.folder_id && (
                                        <DropdownMenuItem onClick={() => handleMoveToFolder(null)}>
                                            <Home className="h-4 w-4 mr-2" />
                                            {t.documents.root}
                                        </DropdownMenuItem>
                                    )}
                                    {folders.filter(f => f.id !== doc.folder_id).map((folder) => (
                                        <DropdownMenuItem key={folder.id} onClick={() => handleMoveToFolder(folder.id)}>
                                            {folder.name}
                                        </DropdownMenuItem>
                                    ))}
                                    {folders.length === 0 && !doc.folder_id && (
                                        <DropdownMenuItem disabled>
                                            {t.documents.noFolders || 'No folders'}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    )
}
