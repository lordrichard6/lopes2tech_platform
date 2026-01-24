"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, KeyRound, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PasswordGeneratorCard() {
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);

    const generatePassword = useCallback(() => {
        const length = 16;
        const charset = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?"
        };

        let newPassword = "";

        // Ensure at least one character from each set
        newPassword += charset.uppercase[Math.floor(Math.random() * charset.uppercase.length)];
        newPassword += charset.lowercase[Math.floor(Math.random() * charset.lowercase.length)];
        newPassword += charset.numbers[Math.floor(Math.random() * charset.numbers.length)];
        newPassword += charset.symbols[Math.floor(Math.random() * charset.symbols.length)];

        // Fill the rest randomly
        const allChars = Object.values(charset).join("");
        for (let i = newPassword.length; i < length; i++) {
            newPassword += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');

        setPassword(newPassword);
        setCopied(false);
    }, []);

    const copyToClipboard = async () => {
        if (!password) return;

        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            toast.success("Password copied to clipboard");

            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy password");
        }
    };

    return (
        <Card className="h-fit">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    Password Generator
                </CardTitle>
                <CardDescription>
                    Generate strong, secure passwords for new accounts.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={password}
                            readOnly
                            placeholder="Click generate..."
                            className="font-mono text-lg pr-10"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={copyToClipboard}
                            disabled={!password}
                            className={cn("transition-all", copied && "text-green-500 border-green-500 bg-green-50 dark:bg-green-900/10")}
                        >
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span className="sr-only">Copy Password</span>
                        </Button>
                        <Button
                            onClick={generatePassword}
                            className="gap-2 min-w-[120px]"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Generate
                        </Button>
                    </div>
                </div>

                {password && (
                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            16 characters
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Strong
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Secure
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
