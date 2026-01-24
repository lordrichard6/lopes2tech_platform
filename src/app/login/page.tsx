import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LoginForm, LoginFooter } from './login-form'
import Image from 'next/image'
import { LanguageSwitcher } from './language-switcher'

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
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Language Switcher */}
                <div className="absolute top-8 right-8">
                    <LanguageSwitcher />
                </div>

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
                        <LoginForm error={error} message={message} />
                    </div>

                    {/* Footer */}
                    <LoginFooter />
                </div>
            </div>
        </div>
    )
}
