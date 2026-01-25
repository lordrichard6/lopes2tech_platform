import { createTaskAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming you have this

export default function NewTaskPage() {
    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <Link href="/dashboard/tasks" className="text-sm text-muted-foreground hover:underline">
                    ← Back to Requests
                </Link>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Submit New Request</CardTitle>
                    <CardDescription>Describe what you need. We&apos;ll review and provide a quote.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createTaskAction}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="title">Request Title</Label>
                                <Input id="title" name="title" placeholder="e.g. Add Blog Section" required />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="priority">Priority</Label>
                                <div className="relative">
                                    <select
                                        name="priority"
                                        id="priority"
                                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium" selected>Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="description">Details</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Provide as much detail as possible..."
                                    className="min-h-[120px]"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button type="submit">Submit Request</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
