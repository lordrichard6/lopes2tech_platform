'use client';

import { Badge } from '@/components/ui/badge';
import { Clock, Send, Eye, CheckCircle } from 'lucide-react';

export type DocumentStatus = 'draft' | 'sent' | 'viewed' | 'signed';

interface DocumentStatusBadgeProps {
    status: DocumentStatus;
    sentAt?: string | null;
    viewedAt?: string | null;
    signedAt?: string | null;
}

const statusConfig: Record<DocumentStatus, { label: string; variant: 'default' | 'secondary' | 'outline'; className: string; icon: React.ElementType }> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-600 border-gray-200',
        icon: Clock,
    },
    sent: {
        label: 'Sent',
        variant: 'secondary',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Send,
    },
    viewed: {
        label: 'Viewed',
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Eye,
    },
    signed: {
        label: 'Signed',
        variant: 'secondary',
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
    },
};

export function DocumentStatusBadge({ status, sentAt, viewedAt, signedAt }: DocumentStatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    // Get tooltip text based on timestamps
    let tooltipText = '';
    if (status === 'sent' && sentAt) {
        tooltipText = `Sent: ${new Date(sentAt).toLocaleString()}`;
    } else if (status === 'viewed' && viewedAt) {
        tooltipText = `Viewed: ${new Date(viewedAt).toLocaleString()}`;
    } else if (status === 'signed' && signedAt) {
        tooltipText = `Signed: ${new Date(signedAt).toLocaleString()}`;
    }

    return (
        <Badge
            variant={config.variant}
            className={`${config.className} flex items-center gap-1 px-2 py-0.5`}
            title={tooltipText}
        >
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

export function getDocumentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        proposal: 'Proposal',
        contract: 'Contract',
        welcome_package: 'Welcome Package',
        handover: 'Handover',
        support_agreement: 'Support Agreement',
        invoice: 'Invoice',
        other: 'Other',
    };
    return labels[type] || 'Document';
}

export function getDocumentTypeColor(type: string): string {
    const colors: Record<string, string> = {
        proposal: 'bg-purple-100 text-purple-700',
        contract: 'bg-blue-100 text-blue-700',
        welcome_package: 'bg-green-100 text-green-700',
        handover: 'bg-orange-100 text-orange-700',
        support_agreement: 'bg-indigo-100 text-indigo-700',
        invoice: 'bg-yellow-100 text-yellow-700',
        other: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || colors.other;
}
