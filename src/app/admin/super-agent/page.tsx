"use client";

import { useState } from "react";
import { ChatInput } from "@/components/super-agent/chat-input";
import { Button } from "@/components/ui/button";
import { Plus, Construction } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuperAgentAdminPage() {
    const [mode, setMode] = useState<'agent' | 'team'>('agent');
    const [hasMessages, setHasMessages] = useState(false);

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] relative rounded-xl border bg-background overflow-hidden shadow-sm">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 absolute top-0 w-full z-10">
                <div className="flex items-center gap-4">
                    {/* Left Spacer */}
                </div>

                {/* Centered Title */}
                <div className="absolute left-1/2 -translate-x-1/2 font-medium text-sm text-muted-foreground flex items-center gap-2">
                    Lopes2Tech Super Agent
                    <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-500/20 font-medium">
                        BETA
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden z-0">
                <div className="-rotate-12 transform select-none">
                    <div className="flex items-center justify-center border-[12px] border-yellow-500 rounded-3xl p-12">
                        <div className="text-center">
                            <Construction className="h-32 w-32 text-yellow-500 mx-auto mb-4" />
                            <h1 className="text-8xl font-black text-yellow-500 uppercase tracking-widest whitespace-nowrap">
                                Under Construction
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto w-full z-10">
                {!hasMessages ? (
                    <div className="text-center space-y-8 max-w-2xl animate-in fade-in zoom-in duration-500">
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">
                            Hi there, what can I help with?
                        </h1>

                        {/* Development Notes / Roadmap */}
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6 text-left max-w-lg mx-auto backdrop-blur-sm">
                            <h3 className="text-yellow-600 dark:text-yellow-400 font-semibold flex items-center gap-2 mb-3">
                                <Construction className="h-4 w-4" />
                                Module Roadmap
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 mt-1.5" />
                                    <span>Connect to LLM Provider (OpenAI/Anthropic)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 mt-1.5" />
                                    <span>Implement tool execution (Database access, Email)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 mt-1.5" />
                                    <span>Add multi-modal capabilities (Image generation, analysis)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/50 mt-1.5" />
                                    <span>Enable context-aware project management</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-3xl space-y-6 pb-32 pt-20">
                        {/* Dummy User Message */}
                        <div className="flex justify-end">
                            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%]">
                                lets work on a project
                            </div>
                        </div>

                        {/* Dummy AI Message */}
                        <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex-shrink-0" />
                            <div className="space-y-4 text-foreground leading-relaxed">
                                <p>I'd be happy to work on a project with you! To get started, I need to understand what you'd like to create.</p>
                                <p>Here are some types of projects I can help with:</p>

                                <div className="space-y-2">
                                    <div className="font-semibold flex items-center gap-2">
                                        🎨 Creative Projects
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        <li><strong className="text-foreground">Documents & Reports</strong> - Professional articles, research papers</li>
                                        <li><strong className="text-foreground">Presentations</strong> - Pitch decks, slides</li>
                                        <li><strong className="text-foreground">Websites</strong> - Landing pages, portfolios</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <div className="font-semibold flex items-center gap-2">
                                        💻 Technical Projects
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        <li><strong className="text-foreground">Web Applications</strong> - Dashboards, tools</li>
                                        <li><strong className="text-foreground">Data Analysis</strong> - Visualizations, spreadsheets</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar Container */}
            <div className="w-full pb-6 pt-2 z-20 bg-gradient-to-t from-background via-background/80 to-transparent">
                {/* Mode Toggles */}
                <div className="flex justify-center gap-2 mb-2">
                    <button
                        onClick={() => { setMode('agent'); setHasMessages(true); }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-colors border",
                            mode === 'agent'
                                ? "bg-muted text-foreground border-border"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Super Agent
                    </button>
                    <button
                        onClick={() => { setMode('team'); setHasMessages(false); }}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-medium transition-colors border",
                            mode === 'team'
                                ? "bg-muted text-foreground border-border"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Team Chat
                    </button>
                </div>

                <ChatInput />

                <div className="text-center text-[10px] text-muted-foreground mt-2">
                    Start a new project or continue where you left off
                </div>
            </div>
        </div>
    );
}
