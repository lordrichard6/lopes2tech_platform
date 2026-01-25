'use client'

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Monitor } from "lucide-react"

export function ThemeSettings() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                        Select your preferred theme
                    </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">
                            <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                Light
                            </div>
                        </SelectItem>
                        <SelectItem value="dark">
                            <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4" />
                                Dark
                            </div>
                        </SelectItem>
                        <SelectItem value="system">
                            <div className="flex items-center gap-2">
                                <Monitor className="h-4 w-4" />
                                System
                            </div>
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
