'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, ArrowRight } from "lucide-react"

interface SubmitButtonProps {
    label?: string;
}

export function SubmitButton({ label = "Sign In" }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full h-12 relative group overflow-hidden rounded-lg font-medium text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-cyan-500" />

            {/* Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cyan-400/20 blur-xl" />

            {/* Content */}
            <div className="relative flex items-center justify-center gap-2">
                {pending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>{label}...</span>
                    </>
                ) : (
                    <>
                        <span>{label}</span>
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                )}
            </div>
        </button>
    )
}
