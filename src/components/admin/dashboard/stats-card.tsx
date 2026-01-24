import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    icon: LucideIcon;
    href: string;
    iconColor?: string;
}

export function StatsCard({ title, value, description, icon: Icon, href, iconColor }: StatsCardProps) {
    return (
        <Link href={href}>
            <Card className="cursor-pointer transition-all duration-300 h-full border hover:border-primary/50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/5 via-card to-card hover:from-primary/10 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {title}
                    </CardTitle>
                    <div className={cn("p-2 rounded-full bg-background/50 border", iconColor && "bg-transparent border-none p-0")}>
                        <Icon className={cn("h-4 w-4", iconColor || "text-foreground")} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
