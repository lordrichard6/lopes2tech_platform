import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileIcon, Download, FileText, Image, File } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function getFileIcon(type: string) {
    if (type.includes('image')) return <Image className="h-6 w-6 text-blue-500" />
    if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    return <File className="h-6 w-6 text-gray-500" />
}

import { cookies } from "next/headers"
import { dictionaries, Locale } from "@/lib/i18n/dictionaries"
import { ClientUploadDialog } from "./client-upload-dialog"
import { getClientProjects } from "./actions"

export default async function DocumentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const cookieStore = await cookies()
    const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as Locale
    const t = dictionaries[locale]

    // 1. Get Client ID linked to this user
    const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('profile_id', user.id)
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

    // 2. Fetch Visible Documents
    const { data: documents, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', clientData.id)
        .eq('is_visible_to_client', true)
        .order('created_at', { ascending: false })

    // 2.1 Fetch Active Projects for Upload Selector
    const activeProjects = await getClientProjects(clientData.id)

    if (docError) {
        return <div>{t.common.error}</div>
    }

    // 3. Generate Signed URLs
    const documentsWithUrls = await Promise.all((documents || []).map(async (doc) => {
        const { data, error } = await supabase.storage
            .from('client-documents')
            .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

        return {
            ...doc,
            downloadUrl: data?.signedUrl || '#'
        };
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{t.documents.title}</h2>
                    <p className="text-muted-foreground">
                        {t.documents.subtitle}
                    </p>
                </div>
                <ClientUploadDialog clientId={clientData.id} projects={activeProjects} />
            </div>

            {documentsWithUrls.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <FileIcon className="h-12 w-12 mb-4 opacity-50" />
                        <p>{t.documents.noDocs}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documentsWithUrls.map((doc) => {
                        return (
                            <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2 space-y-0">
                                    <div className="bg-muted p-2 rounded-lg">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <CardTitle className="text-base font-medium truncate" title={doc.name}>
                                            {doc.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            {formatBytes(doc.size)} • {new Date(doc.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : locale === 'pt' ? 'pt-BR' : 'de-CH')}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild variant="outline" className="w-full gap-2">
                                        {/* Use valid link only if signed URL exists */}
                                        <Link href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-4 w-4" />
                                            {t.documents.download}
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
