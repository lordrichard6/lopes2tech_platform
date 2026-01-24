import { login } from './actions'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginHashHandler } from './hash-handler'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SubmitButton } from './submit-button'
import Image from 'next/image'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const error = typeof params.error === 'string' ? params.error : undefined
    const message = typeof params.message === 'string' ? params.message : undefined

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen flex bg-[#050A18]">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <Image
                    src="/images/office-alps.png"
                    alt="Lopes2Tech Office"
                    fill
                    className="object-cover"
                    priority
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050A18]/80" />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight">
                            <span className="text-white">lopes</span>
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">2</span>
                            <span className="text-white">tech</span>
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">Client Portal</p>
                    </div>

                    {/* Login Card */}
                    <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-75" />

                        {/* Card */}
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                            <div className="space-y-2 text-center mb-8">
                                <h2 className="text-2xl font-semibold text-white">Welcome to my office</h2>
                                <p className="text-gray-400 text-sm">Enter your credentials to access your account</p>
                            </div>

                            <LoginHashHandler />

                            <form action={login} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-300">Email</Label>
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
                                        <Label htmlFor="password" className="text-gray-300">Password</Label>
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

                                <SubmitButton />
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-500 text-sm">
                                    Need help? <a href="mailto:paulo@lopes2tech.ch" className="text-cyan-400 hover:text-cyan-300 transition-colors">Contact Support</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-gray-600 text-xs">
                        © {new Date().getFullYear()} Lopes2Tech. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
