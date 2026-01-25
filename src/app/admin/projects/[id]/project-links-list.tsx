'use server';

import { createClient } from "@/lib/supabase/server";
import { Link2, Trash2, Github, Figma, Trello, Slack, File, Globe, Server, Database, Image, Video, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLinkAction } from "./links-actions";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const IconMap: Record<string, any> = {
    github: Github,
    figma: Figma,
    trello: Trello,
    slack: Slack,
    link: Link2,
    file: File,
    globe: Globe,
    server: Server,
    database: Database,
    image: Image,
    video: Video,
    box: Box,
};

export async function ProjectLinksList({ projectId }: { projectId: string }) {
    const supabase = await createClient();
    const { data: links } = await supabase
        .from('project_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

    if (!links?.length) {
        return <p className="text-sm text-muted-foreground italic px-2">No links added.</p>;
    }

    return (
        <div className="grid gap-2">
            {links.map((link) => {
                const Icon = IconMap[link.icon] || Link2;
                return (
                    <div key={link.id} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-md bg-background border shadow-sm">
                                <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline">
                                    {link.name}
                                </a>
                                {link.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">{link.description}</p>
                                )}
                            </div>
                        </div>
                        <form action={async (formData) => {
                            'use server';
                            await deleteLinkAction(formData);
                        }}>
                            <input type="hidden" name="linkId" value={link.id} />
                            <input type="hidden" name="projectId" value={projectId} />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete link</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </form>
                    </div>
                );
            })}
        </div>
    );
}
