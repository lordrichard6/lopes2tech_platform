
"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/lib/supabase/client";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import * as React from "react";

// Use a custom interface since we don't have types generated yet
interface Notification {
    id: string;
    title: string;
    message: string | null;
    type: string;
    is_read: boolean;
    created_at: string;
    link: string | null;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(20);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n) => !n.is_read).length);
            }

            // Subscribe to realtime updates
            const channel = supabase
                .channel('notifications-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload) => {
                        const newNotification = payload.new as Notification;
                        setNotifications((prev) => [newNotification, ...prev]);
                        setUnreadCount((prev) => prev + 1);
                        // Optional: Play sound or show toast
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        fetchNotifications();
    }, [supabase]);  

    const handleMarkRead = async (id: string, link: string | null) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        await markNotificationAsRead(id);

        if (link) {
            setIsOpen(false);
            router.push(link);
        }
    };

    const handleMarkAllRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        await markAllNotificationsAsRead();
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold leading-none">
                        {t.notifications?.title ?? "Notifications"}
                    </h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllRead}
                        >
                            {t.notifications?.markAllRead ?? "Mark all read"}
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            {t.notifications?.empty ?? "No notifications"}
                        </div>
                    ) : (
                        <div className="grid">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${!notification.is_read ? "bg-muted/20" : ""}`}
                                    onClick={() => handleMarkRead(notification.id, notification.link)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1">
                                            <p className={`text-sm ${!notification.is_read ? "font-semibold" : ""}`}>
                                                {notification.title}
                                            </p>
                                            {notification.message && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
