'use client'

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toggleDocumentVisibility, deleteDocument, sendDocumentToClient, updateDocumentStatus } from "./actions"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { FileText, Download, Trash2, Loader2, Send, CheckCircle } from "lucide-react"
import { DocumentStatusBadge, getDocumentTypeLabel, getDocumentTypeColor, DocumentStatus } from "./document-status-badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DocumentData {
    id: string;
    name: string;
    size: number;
    file_path: string;
    is_visible_to_client: boolean;
    created_at: string;
    status?: DocumentStatus;
    document_type?: string;
    sent_at?: string | null;
    viewed_at?: string | null;
    signed_at?: string | null;
    client_id?: string;
}

export function DocumentRow({ doc, clientEmail }: { doc: DocumentData; clientEmail?: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isToggling, setIsToggling] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isMarkingSigned, setIsMarkingSigned] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleToggle = async (checked: boolean) => {
        try {
            setIsToggling(true)
            await toggleDocumentVisibility(doc.id, checked)
            router.refresh()
        } catch (error) {
            console.error('Toggle failed:', error)
            alert('Failed to update visibility')
        } finally {
            setIsToggling(false)
        }
    }

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteDocument(doc.id, doc.file_path)
            router.refresh()
        } catch (error) {
            console.error('Delete failed:', error)
            alert('Failed to delete document')
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDownload = async () => {
        const { data, error } = await supabase.storage
            .from('client-documents')
            .createSignedUrl(doc.file_path, 60) // 1 minute valid

        if (error) {
            alert('Could not download file')
            return
        }

        window.open(data.signedUrl, '_blank')
    }

    const handleSendToClient = async () => {
        if (!clientEmail) {
            alert('No client email available')
            return
        }

        try {
            setIsSending(true)
            const result = await sendDocumentToClient(doc.id, clientEmail, doc.name)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || 'Failed to send document')
            }
        } catch (error) {
            console.error('Send failed:', error)
            alert('Failed to send document')
        } finally {
            setIsSending(false)
        }
    }

    const handleMarkAsSigned = async () => {
        try {
            setIsMarkingSigned(true)
            await updateDocumentStatus(doc.id, 'signed')
            router.refresh()
        } catch (error) {
            console.error('Mark signed failed:', error)
            alert('Failed to update status')
        } finally {
            setIsMarkingSigned(false)
        }
    }

    const status = doc.status || 'draft'
    const documentType = doc.document_type || 'other'

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card text-card-foreground">
            <div className="flex items-center space-x-4">
                <div className="p-2 bg-secondary/20 rounded-md">
                    <FileText className="h-6 w-6 text-blue-500" />
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium leading-none">{doc.name}</h4>
                        <Badge variant="outline" className={`text-xs ${getDocumentTypeColor(documentType)}`}>
                            {getDocumentTypeLabel(documentType)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                        </p>
                        <DocumentStatusBadge
                            status={status as DocumentStatus}
                            sentAt={doc.sent_at}
                            viewedAt={doc.viewed_at}
                            signedAt={doc.signed_at}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                {/* Visibility Toggle */}
                <div className="flex items-center space-x-2">
                    <Switch
                        checked={doc.is_visible_to_client}
                        onCheckedChange={handleToggle}
                        disabled={isToggling}
                    />
                    <span className="text-xs text-muted-foreground w-14">
                        {doc.is_visible_to_client ? 'Visible' : 'Hidden'}
                    </span>
                </div>

                {/* Send to Client */}
                {clientEmail && status === 'draft' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendToClient}
                        disabled={isSending}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="h-4 w-4 mr-1" />
                                Send
                            </>
                        )}
                    </Button>
                )}

                {/* Mark as Signed (for sent/viewed documents) */}
                {(status === 'sent' || status === 'viewed') && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAsSigned}
                        disabled={isMarkingSigned}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                        {isMarkingSigned ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Signed
                            </>
                        )}
                    </Button>
                )}

                {/* Download */}
                <Button variant="ghost" size="icon" onClick={handleDownload} title="Download">
                    <Download className="h-4 w-4" />
                </Button>

                {/* Delete */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the file from the servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
