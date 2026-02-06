'use client'

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, Send, CheckCircle, XCircle, Trash2, Download, Search, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { DocumentStatusBadge, DocumentStatus } from "@/app/admin/clients/[id]/document-status-badge";
import { updateOfferStatus, deleteOffer } from "./actions";
import { CreateOfferDialog } from "@/components/admin/offers/create-offer-dialog";

type Offer = {
    id: string;
    client_id: string;
    name: string;
    file_path: string;
    status: DocumentStatus;
    document_type: string;
    created_at: string;
    sent_at?: string | null;
    viewed_at?: string | null;
    signed_at?: string | null;
    clients?: { 
        id: string;
        name: string; 
        company_name?: string | null;
        contact_email?: string | null;
    } | null;
};

type StatusFilter = 'all' | 'draft' | 'sent' | 'viewed' | 'signed';

function OffersTableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Offer</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function AdminOffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    useEffect(() => {
        fetchOffers();
    }, []);

    async function fetchOffers() {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("documents")
            .select("*, clients(id, name, company_name, contact_email)")
            .eq('document_type', 'proposal')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching offers:', error);
            toast.error('Failed to load offers');
        }

        if (data) {
            setOffers(data as Offer[]);
        }
        setLoading(false);
    }

    async function handleStatusChange(offerId: string, newStatus: DocumentStatus) {
        const result = await updateOfferStatus(offerId, newStatus);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Offer marked as ${newStatus}`);
            fetchOffers();
        }
    }

    async function handleDelete(offerId: string) {
        if (!confirm("Are you sure you want to delete this offer? This action cannot be undone.")) return;

        const result = await deleteOffer(offerId);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Offer deleted successfully");
            fetchOffers();
        }
    }

    async function handleDownload(offer: Offer) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
            .from('documents')
            .download(offer.file_path);

        if (error) {
            toast.error('Failed to download offer');
            return;
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = offer.name;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Filter offers
    const filteredOffers = offers.filter(offer => {
        const matchesSearch = searchQuery === '' || 
            offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offer.clients?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            offer.clients?.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Count by status
    const statusCounts = {
        all: offers.length,
        draft: offers.filter(o => o.status === 'draft').length,
        sent: offers.filter(o => o.status === 'sent').length,
        viewed: offers.filter(o => o.status === 'viewed').length,
        signed: offers.filter(o => o.status === 'signed').length,
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
                    <CreateOfferDialog onSuccess={fetchOffers} />
                </div>
                <OffersTableSkeleton />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
                <CreateOfferDialog onSuccess={fetchOffers} />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search offers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <TabsList>
                        <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                        <TabsTrigger value="draft">Draft ({statusCounts.draft})</TabsTrigger>
                        <TabsTrigger value="sent">Sent ({statusCounts.sent})</TabsTrigger>
                        <TabsTrigger value="viewed">Viewed ({statusCounts.viewed})</TabsTrigger>
                        <TabsTrigger value="signed">Accepted ({statusCounts.signed})</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Offer</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOffers.map((offer) => (
                            <TableRow key={offer.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-purple-500" />
                                        <span className="font-medium">{offer.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Link 
                                        href={`/admin/clients/${offer.client_id}`}
                                        className="hover:underline flex items-center gap-1"
                                    >
                                        {offer.clients?.company_name || offer.clients?.name}
                                        <ExternalLink className="h-3 w-3 opacity-50" />
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    {new Date(offer.created_at).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <DocumentStatusBadge 
                                        status={offer.status} 
                                        sentAt={offer.sent_at}
                                        viewedAt={offer.viewed_at}
                                        signedAt={offer.signed_at}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="flex items-center cursor-pointer"
                                                onClick={() => handleDownload(offer)}
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download PDF
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link 
                                                    href={`/admin/clients/${offer.client_id}`} 
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Client
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {offer.status === 'draft' && (
                                                <DropdownMenuItem
                                                    className="flex items-center cursor-pointer"
                                                    onClick={() => handleStatusChange(offer.id, 'sent')}
                                                >
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Mark as Sent
                                                </DropdownMenuItem>
                                            )}
                                            {(offer.status === 'sent' || offer.status === 'viewed') && (
                                                <>
                                                    <DropdownMenuItem
                                                        className="flex items-center cursor-pointer"
                                                        onClick={() => handleStatusChange(offer.id, 'signed')}
                                                    >
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Mark as Accepted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center cursor-pointer text-orange-600"
                                                        onClick={() => handleStatusChange(offer.id, 'draft')}
                                                    >
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Mark as Rejected
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(offer.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Offer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!filteredOffers.length && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <FileText className="h-8 w-8" />
                                        <p>No offers found.</p>
                                        {statusFilter !== 'all' && (
                                            <Button 
                                                variant="link" 
                                                onClick={() => setStatusFilter('all')}
                                            >
                                                Clear filters
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
