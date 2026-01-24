'use client'

import { useState } from "react"
import { addCredential, revealCredential, deleteCredential } from "./credentials-actions"
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
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Lock, Eye, EyeOff, Copy, Trash2, Plus, Loader2, Key } from "lucide-react"

export function CredentialsCard({ clientId, credentials }: { clientId: string, credentials: any[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            await addCredential({
                client_id: clientId,
                service_name: formData.get('service_name') as string,
                url: formData.get('url') as string,
                username: formData.get('username') as string,
                password: formData.get('password') as string,
                notes: formData.get('notes') as string
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Failed to add credential')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Credentials Vault</CardTitle>
                    <CardDescription>Securely store passwords and keys.</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Credential
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Credential</DialogTitle>
                            <DialogDescription>
                                Passwords are encrypted before storage.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="service_name">Service Name</Label>
                                <Input id="service_name" name="service_name" placeholder="e.g. WordPress Admin" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">URL (Optional)</Label>
                                <Input id="url" name="url" placeholder="https://..." />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" placeholder="admin" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="text" placeholder="SuperSecre!123" required />
                                <p className="text-xs text-muted-foreground">We recommend generating a strong password.</p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea id="notes" name="notes" placeholder="Additional details..." />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save to Vault
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {credentials?.length ? credentials.map(cred => (
                        <CredentialRow key={cred.id} credential={cred} />
                    )) : (
                        <p className="text-sm text-muted-foreground py-4 text-center">No credentials stored yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function CredentialRow({ credential }: { credential: any }) {
    const [revealedPassword, setRevealedPassword] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleReveal = async () => {
        if (revealedPassword) {
            setRevealedPassword(null)
            return
        }

        setIsLoading(true)
        try {
            const password = await revealCredential(credential.id)
            setRevealedPassword(password)
        } catch (error) {
            alert('Failed to reveal password')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = () => {
        if (revealedPassword) {
            navigator.clipboard.writeText(revealedPassword)
            // Could add toast here
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this credential?')) return
        setIsDeleting(true)
        try {
            await deleteCredential(credential.id)
            router.refresh()
        } catch (error) {
            alert('Failed to delete')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-start space-x-3">
                <div className="mt-1 p-2 bg-secondary/20 rounded-md">
                    <Key className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-medium">{credential.service_name}</h4>
                    <div className="text-sm text-muted-foreground">
                        {credential.username && <span className="mr-3">{credential.username}</span>}
                        {credential.url && (
                            <a href={credential.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Launch
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-muted/50 rounded-md px-3 py-1 min-w-[120px] justify-between">
                    <span className="text-sm font-mono">
                        {revealedPassword || '••••••••••••'}
                    </span>
                    <div className="flex space-x-1 ml-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleReveal}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : (revealedPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />)}
                        </Button>
                        {revealedPassword && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
