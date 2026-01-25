"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/language-context";
import { markScheduleProcessingAction } from "../actions";

interface MarkPaidButtonProps {
    scheduleId: string;
    status: string;
}

export function MarkPaidButton({ scheduleId, status }: MarkPaidButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();

    const handleMarkPaid = async () => {
        setIsLoading(true);
        try {
            const result = await markScheduleProcessingAction(scheduleId);

            if (result.error) throw new Error(result.error);

            toast.success('Payment marked as processing. Waiting for admin approval.');
            router.refresh();
        } catch (error: any) {
            console.error('Error marking as paid:', error);
            toast.error(error.message || 'Failed to update status. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'processing') {
        return (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1 whitespace-nowrap">
                <Clock className="w-3 h-3" />
                {t.invoices.details.pendingVerification}
            </Badge>
        );
    }

    if (status === 'paid') {
        return null; // Already confirmed
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleMarkPaid}
            disabled={isLoading}
            className="gap-2 h-8 text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            title="I have made this transfer"
        >
            {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <CheckCircle2 className="h-3 w-3" />
            )}
            {t.invoices.details.pay}
        </Button>
    );
}
