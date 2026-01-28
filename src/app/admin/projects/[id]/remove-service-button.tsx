'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeServiceFromProjectAction } from "./actions";

interface RemoveServiceButtonProps {
    projectId: string;
    serviceId: string;
}

export function RemoveServiceButton({ projectId, serviceId }: RemoveServiceButtonProps) {
    const [removing, setRemoving] = useState(false);

    const handleRemove = async () => {
        setRemoving(true);
        const result = await removeServiceFromProjectAction(projectId, serviceId);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success('Service removed');
        }
        setRemoving(false);
    };

    return (
        <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
            disabled={removing}
        >
            {removing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
                <X className="h-3 w-3" />
            )}
        </Button>
    );
}
