"use client";

import { User, Mic, Paperclip, ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ChatInput() {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 relative">
            <div className="bg-background/80 backdrop-blur rounded-2xl border shadow-lg p-3">
                <Textarea
                    placeholder="Ask anything, create anything"
                    className="min-h-[60px] max-h-[200px] w-full bg-transparent border-0 focus-visible:ring-0 resize-none px-2 text-lg"
                />

                <div className="flex justify-between items-center mt-2 px-2">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                            <User className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground">
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Button size="icon" className="h-9 w-9 rounded-xl">
                            <ArrowUp className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
