"use client";

import { useActionState, useState } from 'react'; // React 19 replacement for useFormState
import { useLanguage } from "@/contexts/language-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmitButton } from './submit-button';
import { LoginHashHandler } from './hash-handler';
import { login } from './actions';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
    error?: string;
    message?: string;
}

const initialState = {
    error: '',
    message: ''
};

export function LoginForm({ error: urlError, message: urlMessage }: LoginFormProps) {
    const { t } = useLanguage();
    // Use useActionState for React 19
    const [state, formAction] = useActionState(login, initialState);
    const [showPassword, setShowPassword] = useState(false);

    // Prioritize state error, allow URL error as fallback
    const displayError = state?.error || urlError;
    const displayMessage = state?.message || urlMessage;

    return (
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="space-y-2 text-center mb-8">
                <h2 className="text-2xl font-semibold text-white">{t.auth.title}</h2>
                <p className="text-gray-400 text-sm">{t.auth.subtitle}</p>
            </div>

            <LoginHashHandler />

            <form action={formAction} className="space-y-6">
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
                        <div className="relative w-full">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20 h-12 pr-12 w-full"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 z-10"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {(displayError || displayMessage) && (
                    <Alert className={`${displayError ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"}`}>
                        <AlertDescription>
                            {displayError || displayMessage}
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
