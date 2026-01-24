import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

export default function AuthCodeErrorPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
            <div className="mx-auto flex w-full max-w-md flex-col items-center space-y-6 rounded-lg border bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Authentication Failed</h1>
                    <p className="text-gray-500">
                        The link you used is invalid or has expired. Please request a new one or try logging in directly.
                    </p>
                </div>
                <div className="flex w-full flex-col space-y-3">
                    <Button asChild className="w-full">
                        <Link href="/login">Return to Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
