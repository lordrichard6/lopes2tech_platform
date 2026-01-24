'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Lock, UserPlus, Mail, Loader2 } from 'lucide-react';
import { enablePortalAccessAction, sendWelcomeEmailAction } from './actions';
import { toast } from 'sonner';

interface PortalAccessCardProps {
    clientId: string;
    clientName: string;
    clientEmail: string | null;
    profileId: string | null; // If present, account works
}

function SubmitButton({ children, text }: { children: React.ReactNode, text: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {pending ? text : children}
        </Button>
    );
}

export function PortalAccessCard({ clientId, clientName, clientEmail, profileId }: PortalAccessCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);

    if (profileId) {
        return (
            <Card className="h-fit border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Portal Access
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>

                            <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-500/20"
                                                >
                                                    <Mail className="h-4 w-4" />
                                                    <span className="sr-only">Send Welcome Email</span>
                                                </Button>
                                            </DialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Send Welcome Email</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Send Welcome Email</DialogTitle>
                                        <DialogDescription>
                                            Send a portal invitation link to <strong>{clientName}</strong>.
                                            This will include a secure link to set their password.
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form action={async (formData) => {
                                        const result = await sendWelcomeEmailAction(formData);
                                        if (result?.error) {
                                            toast.error(result.error);
                                        } else {
                                            toast.success("Welcome email sent successfully!");
                                            setIsEmailOpen(false);
                                        }
                                    }}>
                                        <input type="hidden" name="clientId" value={clientId} />

                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="language">Email Language</Label>
                                                <select
                                                    id="language"
                                                    name="language"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                    defaultValue="en"
                                                >
                                                    <option value="en">English (Default)</option>
                                                    <option value="de">German (Deutsch)</option>
                                                    <option value="pt">Portuguese (Português)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <SubmitButton text="Sending...">Send Email</SubmitButton>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Account enabled for {clientEmail}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-fit">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Portal Access
                    </CardTitle>
                    <Badge variant="outline">Inactive</Badge>
                </div>
                <CardDescription>
                    Client cannot log in.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full gap-2" variant="default">
                            <UserPlus className="h-4 w-4" />
                            Enable Access
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enable Portal Access</DialogTitle>
                            <DialogDescription>
                                Create a login account for <strong>{clientName}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <form action={async (formData) => {
                            const result = await enablePortalAccessAction(formData);
                            if (result?.error) {
                                toast.error(result.error);
                            } else {
                                toast.success("Portal access enabled!");
                                setIsOpen(false);
                            }
                        }}>
                            <input type="hidden" name="clientId" value={clientId} />

                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Login Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={clientEmail || ''}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Set Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="text" // Visible so admin knows what they set
                                        placeholder="Generate secure password"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Admin will know this password initially. Client can change it.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <SubmitButton text="Enabling...">Enable Access</SubmitButton>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
