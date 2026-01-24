import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function InvoicesTableSkeleton() {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="w-[200px]">Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="h-4 w-[80px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-[150px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-[100px]" />
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[80px]" />
                                    <Skeleton className="h-3 w-[60px]" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-2">
                                    <Skeleton className="h-2 w-full" />
                                    <Skeleton className="h-3 w-[40px] ml-auto" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-5 w-[80px] rounded-full" />
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end">
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
