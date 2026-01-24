"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, AlertTriangle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateClients, replaceAllClients } from "@/app/admin/clients/actions";
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

interface ClientImportExportProps {
    clients: any[];
}

export function ClientImportExport({ clients }: ClientImportExportProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [replaceAll, setReplaceAll] = useState(false);
    const [showImportModeDialog, setShowImportModeDialog] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const headers = [
        "name", "contact_email", "company_name", "status"
    ];

    const convertToCSV = (objArray: any[]) => {
        const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
        let str = headers.join(",") + "\r\n";

        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (let index in headers) {
                if (line !== '') line += ',';
                const header = headers[index];

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
        const exportData = clients.map(c => ({
            name: c.name,
            contact_email: c.contact_email || "",
            company_name: c.company_name || "",
            status: c.status || 'lead'
        }));

        const csv = convertToCSV(exportData);
        downloadCSV(csv, `clients_export_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success("Clients exported successfully");
    };

    const handleTemplate = () => {
        const templateData = [{
            name: "John Doe",
            contact_email: "john@example.com",
            company_name: "Acme Corp",
            status: "active"
        }];
        const csv = convertToCSV(templateData);
        downloadCSV(csv, "clients_template.csv");
        toast.info("Template downloaded");
    };

    const handleImportClick = () => {
        setShowImportModeDialog(true);
    };

    const selectImportMode = (mode: 'append' | 'replace') => {
        setReplaceAll(mode === 'replace');
        setShowImportModeDialog(false);
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
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("File is empty or missing headers");

                const headersInFile = lines[0].split(',').map(h => h.trim());
                const clientsToImport = [];

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
                    const obj: any = {};
                    headersInFile.forEach((header, index) => {
                        obj[header] = values?.[index]?.replace(/^"|"$/g, '') || "";
                    });

                    // Remap 'email' -> 'contact_email' if needed to be forgiving
                    if (obj.email && !obj.contact_email) obj.contact_email = obj.email;

                    clientsToImport.push(obj);
                }

                if (replaceAll) {
                    await replaceAllClients(clientsToImport);
                    toast.success(`Successfully replaced list with ${clientsToImport.length} clients`);
                } else {
                    await bulkCreateClients(clientsToImport);
                    toast.success(`Successfully imported ${clientsToImport.length} clients`);
                }

                if (fileInputRef.current) fileInputRef.current.value = '';
                setPendingFile(null);
                setShowConfirm(false);
            } catch (error) {
                console.error("Import error:", error);
                toast.error(error instanceof Error ? error.message : "Failed to import clients");
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
                            <p>Export Clients to CSV</p>
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
                            <p>{isImporting ? 'Importing...' : 'Import Clients'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <Dialog open={showImportModeDialog} onOpenChange={setShowImportModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Clients</DialogTitle>
                        <DialogDescription>
                            How would you like to import these clients?
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

            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will DELETE all existing clients and replace them with the data from your CSV file.

                            <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded text-sm text-yellow-800 dark:text-yellow-200 flex items-start">
                                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                                <span>Note: Clients with open Invoices or active Subscriptions might not be fully deletable depending on database constraints.</span>
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
