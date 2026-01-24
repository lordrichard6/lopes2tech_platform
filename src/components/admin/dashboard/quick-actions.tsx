"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilePlus, Target, UserPlus, FileText } from "lucide-react";
import Link from "next/link";
import { CreateClientDialog } from "@/components/admin/clients/create-client-dialog";
import { GlobalCreateProjectDialog } from "@/components/admin/projects/global-create-project-dialog";
import { CreateInvoiceDialog } from "@/app/admin/invoices/create-invoice-dialog";

export function QuickActions() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <CreateClientDialog>
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-blue-500 hover:text-blue-500 transition-colors">
                        <UserPlus className="h-6 w-6" />
                        New Client
                    </Button>
                </CreateClientDialog>

                <GlobalCreateProjectDialog>
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-green-500 hover:text-green-500 transition-colors">
                        <Target className="h-6 w-6" />
                        New Project
                    </Button>
                </GlobalCreateProjectDialog>

                <CreateInvoiceDialog>
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-purple-500 hover:text-purple-500 transition-colors">
                        <FilePlus className="h-6 w-6" />
                        New Invoice
                    </Button>
                </CreateInvoiceDialog>

                <Link href="/admin/invoices" className="w-full">
                    <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-orange-500 hover:text-orange-500 transition-colors">
                        <FileText className="h-6 w-6" />
                        View Reports
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
