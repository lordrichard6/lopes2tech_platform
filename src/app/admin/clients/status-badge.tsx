import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CircleDashed,
    Target,
    FileText,
    UserCheck,
    Crown,
    PauseCircle,
    UserX,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ClientStatus = 'lead' | 'qualified' | 'proposal' | 'client' | 'vip' | 'inactive' | 'churned';

interface StatusBadgeProps {
    status: ClientStatus | string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; description: string }> = {
    'lead': {
        label: 'Lead',
        icon: CircleDashed,
        color: 'bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/20',
        description: 'New contact, exploring interest.'
    },
    'qualified': {
        label: 'Qualified',
        icon: Target,
        color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
        description: 'Qualified lead, showing genuine interest.'
    },
    'proposal': {
        label: 'Proposal',
        icon: FileText,
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20',
        description: 'Quote or proposal sent, awaiting decision.'
    },
    'client': {
        label: 'Client',
        icon: UserCheck,
        color: 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20',
        description: 'Active paying customer.'
    },
    'vip': {
        label: 'VIP',
        icon: Crown,
        color: 'bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20',
        description: 'High-value or long-term client.'
    },
    'inactive': {
        label: 'Inactive',
        icon: PauseCircle,
        color: 'bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20',
        description: 'No active services, relationship intact.'
    },
    'churned': {
        label: 'Churned',
        icon: UserX,
        color: 'bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20',
        description: 'Lost client, relationship ended.'
    }
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status || 'Unknown',
        icon: HelpCircle,
        color: 'bg-gray-100 text-gray-600 border-gray-200',
        description: 'Status unknown'
    };

    const Icon = config.icon;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn("gap-1.5 cursor-help pr-2.5", config.color)}>
                        <Icon className="h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
