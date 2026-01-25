"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeColor, ThemeColor } from "@/contexts/theme-color-context";
import { useLanguage } from "@/contexts/language-context";
import { Label } from "@/components/ui/label";

const PALETTES: { id: ThemeColor; color: string }[] = [
    { id: "horizon", color: "#4318ff" }, // Indigo
    { id: "sunset", color: "#f97316" },  // Orange
    { id: "forest", color: "#10b981" },  // Green
    { id: "minimal", color: "#18181b" }, // Black
];

export function ColorPaletteSelector() {
    const { theme } = useTheme();
    const { themeColor, setThemeColor } = useThemeColor();
    const { t } = useLanguage();

    // Only show if Light Mode is active or system is Light
    // Note: 'system' might be tricky, but usually we care when resolvedTheme is 'light'.
    // For simplicity, we just show it always or condition on theme !== 'dark'.
    // Better to let user pick preference even if currently in dark mode, though it only applies to light mode.
    // But per user request: "When I have the light theme selected..."

    // Check if effective theme is light
    // useTheme provides resolvedTheme ('light' | 'dark')
    // We need to wait for mount to know resolvedTheme to avoid hydration mismatch, 
    // but the component typically renders client side.

    // Actually, simpler approach: Always show it but maybe label it "Light Theme Color".

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Label>{t.dashboard.theme.title}</Label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {PALETTES.map((palette) => (
                    <button
                        key={palette.id}
                        type="button"
                        onClick={() => setThemeColor(palette.id)}
                        className={cn(
                            "group relative flex items-center justify-between rounded-lg border-2 p-4 transition-all hover:bg-accent",
                            themeColor === palette.id ? "border-primary bg-accent" : "border-muted"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="h-6 w-6 rounded-full border shadow-sm"
                                style={{ backgroundColor: palette.color }}
                            />
                            <span className="text-sm font-medium">
                                {t.dashboard.theme[palette.id]}
                            </span>
                        </div>
                        {themeColor === palette.id && (
                            <div className="absolute top-2 right-2 text-primary">
                                <Check className="h-4 w-4" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
