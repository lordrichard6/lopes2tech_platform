import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    CircleDashed,
    Code,
    CheckCircle,
    Zap,
    Ghost,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type ClientStatus = 'lead' | 'pre-approval' | 'in-development' | 'completed' | 'maintenance' | 'inactive' | 'churned';

interface StatusBadgeProps {
    status: ClientStatus | string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string; description: string }> = {
    'lead': {
        label: 'Lead',
        icon: CircleDashed,
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20',
        description: 'Potential client, initial contact made.'
    },
    'pre-approval': {
        label: 'Pre-Approval',
        icon: CircleDashed,
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20',
        description: 'Offer sent, awaiting approval.'
    },
    'in-development': {
        label: 'In Development',
        icon: Code,
        color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
        description: 'Project is currently being built.'
    },
    'completed': {
        label: 'Completed',
        icon: CheckCircle,
        color: 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20',
        description: 'Project finished and delivered.'
    },
    'maintenance': {
        label: 'Maintenance',
        icon: Zap,
        color: 'bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20',
        description: 'Active maintenance contract.'
    },
    'inactive': {
        label: 'Inactive',
        icon: Ghost,
        color: 'bg-gray-500/10 text-gray-600 border-gray-200 hover:bg-gray-500/20',
        description: 'No active projects or maintenance.'
    },
    'churned': {
        label: 'Churned',
        icon: Ghost,
        color: 'bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20',
        description: 'Client left or cancelled.'
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
