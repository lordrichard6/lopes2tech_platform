"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateServices, replaceAllServices } from "@/app/admin/services/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServiceImportExportProps {
    services: any[];
}

export function ServiceImportExport({ services }: ServiceImportExportProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [replaceAll, setReplaceAll] = useState(false);
    const [showImportModeDialog, setShowImportModeDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const headers = [
        "name", "price", "price_eur", "billing_type", "active",
        "name_en", "name_pt", "name_de",
        "description_en", "description_pt", "description_de"
    ];

    const convertToCSV = (objArray: any[]) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = headers.join(",") + "\r\n";

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in headers) {
                if (line !== '') line += ',';
                const header = headers[index];

                // Handle descriptions with newlines/commas by wrapping in quotes
                let val = array[i][header];
                if (val === null || val === undefined) val = "";
                val = String(val).replace(/"/g, '""'); // Escape double quotes
                if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`;

                line += val;
            }
            str += line + "\r\n";
        }
        return str;
    };

    const downloadCSV = (csvContent: string, fileName: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleExport = () => {
        // Prepare data for export - flatten or map as needed
        const exportData = services.map(s => ({
            name: s.name,
            price: s.price,
            price_eur: s.price_eur || 0,
            billing_type: s.billing_type,
            active: s.active,
            name_en: s.name_en || s.name,
            name_pt: s.name_pt || "",
            name_de: s.name_de || "",
            description_en: s.description_en || s.description || "",
            description_pt: s.description_pt || "",
            description_de: s.description_de || ""
        }));

        const csv = convertToCSV(exportData);
        downloadCSV(csv, `services_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Services exported successfully");
    };

    const handleTemplate = () => {
        const templateData = [{
            name: "Example Service",
            price: "100.00",
            price_eur: "90.00",
            billing_type: "one_time",
            active: "true",
            name_en: "Example Service",
            name_pt: "Serviço Exemplo",
            name_de: "Beispiel Service",
            description_en: "- Feature 1\n- Feature 2",
            description_pt: "- Funcionalidade 1",
            description_de: "- Merkmal 1"
        }];
        const csv = convertToCSV(templateData);
        downloadCSV(csv, "services_template.csv");
        toast.info("Template downloaded");
    };

    const handleImportClick = () => {
        setShowImportModeDialog(true);
    };

    const selectImportMode = (mode: 'append' | 'replace') => {
        setReplaceAll(mode === 'replace');
        setShowImportModeDialog(false);
        // Add timeout to ensure state update before click? 
        // Actually refs + state updates in same tick might be tricky if we rely on state in the change handler immediately.
        // But 'replaceAll' state setter is async.
        // It's safer to use a timeout or useEffect, OR just rely on the fact that file dialog takes time.
        setTimeout(() => {
            fileInputRef.current?.click();
        }, 100);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (replaceAll) {
            setPendingFile(file);
            setShowConfirm(true);
        } else {
            processImport(file);
        }
    };

    const processImport = async (file: File) => {
        setIsImporting(true);
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                // Simple CSV parser
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("File is empty or missing headers");

                const headersInFile = lines[0].split(',').map(h => h.trim());
                // Basic validation of headers could go here

                const servicesToImport = [];

                // Helper to parse CSV line respecting quotes
                const parseLine = (line: string) => {
                    const result = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            if (inQuotes && line[i + 1] === '"') {
                                current += '"';
                                i++;
                            } else {
                                inQuotes = !inQuotes;
                            }
                        } else if (char === ',' && !inQuotes) {
                            result.push(current);
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current);
                    return result;
                };

                for (let i = 1; i < lines.length; i++) {
                    const values = parseLine(lines[i]);
                    // Map values to object based on headers
                    const obj: any = {};
                    headersInFile.forEach((header, index) => {
                        obj[header] = values?.[index]?.replace(/^"|"$/g, '') || "";
                    });

                    // Cleanup format for action
                    obj.price = parseFloat(obj.price) || 0;
                    obj.price_eur = parseFloat(obj.price_eur) || 0;
                    obj.active = String(obj.active).toLowerCase() === 'true';

                    servicesToImport.push(obj);
                }

                if (replaceAll) {
                    await replaceAllServices(servicesToImport);
                    toast.success(`Successfully replaced catalog with ${servicesToImport.length} services`);
                } else {
                    await bulkCreateServices(servicesToImport);
                    toast.success(`Successfully imported ${servicesToImport.length} services`);
                }

                // Reset input
                if (fileInputRef.current) fileInputRef.current.value = '';
                setPendingFile(null);
                setShowConfirm(false);
            } catch (error) {
                console.error("Import error:", error);
                toast.error(error instanceof Error ? error.message : "Failed to import services");
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <>
            <div className="flex gap-2 items-center">
                <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                />

                <TooltipProvider>
                    <Tooltip delayDuration={300}>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleTemplate} className="cursor-pointer h-8 w-8">
                                <FileJson className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download CSV Template</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon" onClick={handleExport} className="cursor-pointer h-8 w-8">
                                <Download className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Export Services to CSV</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleImportClick}
                                disabled={isImporting}
                                className="cursor-pointer h-8 w-8"
                            >
                                <Upload className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isImporting ? 'Importing...' : 'Import Services'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Step 1: Mode Selection */}
            <Dialog open={showImportModeDialog} onOpenChange={setShowImportModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Services</DialogTitle>
                        <DialogDescription>
                            How would you like to import these services?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 border-2 hover:border-primary/50"
                            onClick={() => selectImportMode('append')}
                        >
                            <Plus className="h-6 w-6 text-primary" />
                            <div className="text-center">
                                <span className="block font-semibold">Append</span>
                                <span className="text-xs text-muted-foreground font-normal">Add to existing list</span>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 border-2 hover:border-red-500/50"
                            onClick={() => selectImportMode('replace')}
                        >
                            <RefreshCw className="h-6 w-6 text-red-500" />
                            <div className="text-center">
                                <span className="block font-semibold text-red-600 dark:text-red-400">Replace All</span>
                                <span className="text-xs text-muted-foreground font-normal">Delete & Re-upload</span>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Step 2: Confirmation for Replace All */}
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will DELETE all existing services and replace them with the data from your CSV file.

                            <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>Note: Services currently used by active subscriptions or projects cannot be deleted. The import will fail if you try to replace them.</span>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setPendingFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => pendingFile && processImport(pendingFile)} className="bg-destructive text-white hover:bg-destructive/90">
                            Yes, Replace All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
