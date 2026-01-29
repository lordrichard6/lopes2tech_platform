import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cookies } from "next/headers"
import { dictionaries, Locale } from "@/lib/i18n/dictionaries"
import { DocumentsActionsWithFab } from "./client-upload-dialog"
import { getClientProjects } from "./actions"
import { CreateFolderDialog } from "./create-folder-dialog"
import { DocumentGridItem } from "./document-grid-item"
import { FolderGridItem } from "./folder-grid-item"

interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: string;
}

export default async function DocumentsPage({
    searchParams,
}: {
    searchParams: Promise<{ folder?: string }>
}) {
    const params = await searchParams
    const currentFolderId = params.folder || null

    const supabase = await createClient()
    const adminDb = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const cookieStore = await cookies()
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale
    const t = dictionaries[locale]

    // Get Client ID (check both profile_id and contact_email)
    const { data: clientData, error: clientError } = await adminDb
        .from('clients')
        .select('id')
        .or(`profile_id.eq.${user.id},contact_email.ilike.${user.email}`)
        .single()

    if (clientError || !clientData) {
        return (
            <div className="p-4">
                <Card className="bg-destructive/10 border-destructive/20 text-destructive">
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                        <CardDescription>{t.documents.errorDetails}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    // Fetch folders for this client
    const { data: allFolders } = await adminDb
        .from('document_folders')
        .select('*')
        .eq('client_id', clientData.id)
        .order('name')

    // Get folders in current directory
    const foldersInCurrentDir = (allFolders || []).filter(f => 
        currentFolderId ? f.parent_id === currentFolderId : f.parent_id === null
    )

    // Build breadcrumb path
    const breadcrumbs: Folder[] = []
    if (currentFolderId && allFolders) {
        let folder = allFolders.find(f => f.id === currentFolderId)
        while (folder) {
            breadcrumbs.unshift(folder)
            folder = folder.parent_id ? allFolders.find(f => f.id === folder!.parent_id) : undefined
        }
    }

    // Fetch documents in current folder
    const docsQuery = adminDb
        .from('documents')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('is_visible_to_client', true)
        .order('created_at', { ascending: false })

    if (currentFolderId) {
        docsQuery.eq('folder_id', currentFolderId)
    } else {
        docsQuery.is('folder_id', null)
    }

    const { data: documents } = await docsQuery

    // Fetch Active Projects for Upload Selector
    const activeProjects = await getClientProjects(clientData.id)

    // Generate Signed URLs
    const documentsWithUrls = await Promise.all((documents || []).map(async (doc) => {
        const { data } = await adminDb.storage
            .from('client-documents')
            .createSignedUrl(doc.file_path, 3600)
        return { ...doc, downloadUrl: data?.signedUrl || '#' }
    }))

    const isEmpty = foldersInCurrentDir.length === 0 && documentsWithUrls.length === 0

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{t.sidebar.documents}</h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {t.documents.subtitle}
                    </p>
                </div>
                <DocumentsActionsWithFab 
                    clientId={clientData.id} 
                    projects={activeProjects}
                    currentFolderId={currentFolderId}
                />
            </div>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-1">
                <Link 
                    href="/documents"
                    className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-muted transition-colors shrink-0 ${!currentFolderId ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.documents.root || 'Root'}</span>
                </Link>
                {breadcrumbs.map((folder, index) => (
                    <div key={folder.id} className="flex items-center gap-1 shrink-0">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Link 
                            href={`/documents?folder=${folder.id}`}
                            className={`px-2 py-1 rounded hover:bg-muted transition-colors truncate max-w-[120px] sm:max-w-[200px] ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                        >
                            {folder.name}
                        </Link>
                    </div>
                ))}
            </nav>

            {/* Content Grid */}
            {isEmpty ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <FileIcon className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-sm">{currentFolderId ? (t.documents.emptyFolder || 'This folder is empty') : t.documents.noDocs}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {/* Folders first */}
                    {foldersInCurrentDir.map((folder) => (
                        <FolderGridItem 
                            key={folder.id} 
                            folder={folder}
                        />
                    ))}
                    
                    {/* Documents */}
                    {documentsWithUrls.map((doc) => (
                        <DocumentGridItem
                            key={doc.id}
                            doc={doc}
                            locale={locale}
                            downloadLabel={t.documents.download}
                            folders={allFolders || []}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
