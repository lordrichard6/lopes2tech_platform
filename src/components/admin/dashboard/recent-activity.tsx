import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
import { FileText, User, CheckCircle2 } from "lucide-react";

interface Activity {
    id: string;
    type: 'invoice' | 'client' | 'project';
    description: string;
    date: string;
    user?: {
        name: string;
        avatar?: string;
    };
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
    if (activities.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No recent activity found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 relative">
                        {index !== activities.length - 1 && (
                            <div className="absolute left-4 top-8 bottom-[-24px] w-[1px] bg-muted" />
                        )}

                        <div className="relative z-10 bg-background">
                            {activity.type === 'invoice' && <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"><FileText className="h-4 w-4" /></div>}
                            {activity.type === 'client' && <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><User className="h-4 w-4" /></div>}
                            {activity.type === 'project' && <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"><CheckCircle2 className="h-4 w-4" /></div>}
                        </div>

                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {activity.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatDate(activity.date)}</span>
                                {activity.user && (
                                    <>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Avatar className="h-4 w-4">
                                                <AvatarImage src={activity.user.avatar} />
                                                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <span>{activity.user.name}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
