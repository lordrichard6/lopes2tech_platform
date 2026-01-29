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
        <div className="flex flex-wrap gap-3">
            {links.map((link) => {
                const Icon = IconMap[link.icon] || Link2;
                const tooltipContent = (
                    <div className="space-y-1">
                        <div className="font-semibold">{link.name}</div>
                        {link.description && (
                            <div className="text-xs text-muted-foreground max-w-[200px]">{link.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground/80 truncate max-w-[200px]">{link.url}</div>
                    </div>
                );
                
                return (
                    <div key={link.id} className="relative group">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-12 h-12 rounded-lg border bg-card hover:bg-accent/50 transition-all hover:scale-105 hover:shadow-md"
                                    >
                                        <Icon className="w-5 h-5 text-primary" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[250px]">
                                    {tooltipContent}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <form 
                            action={async (formData) => {
                                'use server';
                                await deleteLinkAction(formData);
                            }}
                            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                            <input type="hidden" name="linkId" value={link.id} />
                            <input type="hidden" name="projectId" value={projectId} />
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            type="submit" 
                                            variant="destructive" 
                                            size="icon" 
                                            className="h-6 w-6 rounded-full shadow-lg"
                                        >
                                            <Trash2 className="w-3 h-3" />
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
