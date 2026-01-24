"use client";

import { useLanguage } from "@/contexts/language-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmitButton } from './submit-button';
import { LoginHashHandler } from './hash-handler';
import { login } from './actions';
import Link from 'next/link';

interface LoginFormProps {
    error?: string;
    message?: string;
}

export function LoginForm({ error, message }: LoginFormProps) {
    const { t } = useLanguage();

    return (
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-2 text-center mb-8">
                <h2 className="text-2xl font-semibold text-white">{t.auth.title}</h2>
                <p className="text-gray-400 text-sm">{t.auth.subtitle}</p>
            </div>

            <LoginHashHandler />

            <form action={login} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">{t.auth.email}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-300">{t.auth.password}</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 h-12"
                        />
                    </div>
                </div>

                {(error || message) && (
                    <Alert className={`${error ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"}`}>
                        <AlertDescription>
                            {error || message}
                        </AlertDescription>
                    </Alert>
                )}

                <SubmitButton label={t.auth.login} />
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                    {t.auth.needHelp} <a href="mailto:paulo@lopes2tech.ch" className="text-cyan-400 hover:text-cyan-300 transition-colors">{t.auth.contactSupport}</a>
                </p>
            </div>
        </div>
    );
}

export function LoginFooter() {
    const { t } = useLanguage();
    return (
        <p className="text-center text-gray-600 text-xs">
            © {new Date().getFullYear()} {t.auth.footer}
        </p>
    );
}
