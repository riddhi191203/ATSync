import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useSeo } from '../../../shared/seo/useSeo'

const Login = () => {
    useSeo({
        title: "Login",
        description:
            "Sign in to ATSync - AI Resume Analyser to improve ATS scores, analyze resumes, detect skill gaps, and prepare for interviews with AI.",
        canonicalPath: "/login",
        keywords: [
            "ATSync",
            "AI resume analyser",
            "ATS resume checker",
            "resume ATS score",
            "AI interview preparation",
            "resume skill gap analysis",
        ],
        robots: "index,follow",
        ogType: "website",
    })

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await handleLogin({ email, password })
            navigate('/')
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f9fb] px-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-4xl bg-white px-8 py-10 text-center shadow-[0_20px_40px_rgba(25,28,30,0.06)]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#111c2d] border-t-transparent" />

                    <div>
                        <p className="text-2xl font-bold text-[#191c1e]">
                            Welcome to ATSync
                        </p>

                        <p className="mt-2 text-sm text-[#45464d]">
                            Please wait while we restore your workspace.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex min-h-screen w-full flex-col overflow-hidden bg-[#f7f9fb] text-[#191c1e] md:flex-row">
            {/* Left Section */}
            <section className="relative hidden md:flex md:w-[58%] items-end overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10" />

                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                    alt="Office Workspace"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-[#111c2d] via-transparent to-transparent opacity-80 z-20" />

                <div className="relative z-30 max-w-xl p-14">
                    <Link
                        to="/"
                        className="mb-8 inline-block text-4xl font-bold tracking-wide text-white"
                    >
                        ATSync
                    </Link>

                    <h1 className="mb-5 text-6xl font-extrabold leading-tight text-white">
                        AI-Powered <br /> Resume Analyser
                    </h1>

                    <p className="text-lg leading-relaxed text-[#d3dceb]">
                        Analyze resumes, improve ATS scores, identify skill gaps,
                        and prepare smarter for interviews using AI-powered insights.
                    </p>
                </div>
            </section>

            {/* Right Section */}
            <section className="flex flex-1 items-center justify-center px-6 py-10 md:px-12">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="mb-3 text-center text-4xl font-bold tracking-tight text-[#191c1e]">
                            Welcome to ATSync
                        </h2>

                        <p className="text-center text-[#5a5d66]">
                            Sign in to continue your AI-powered career journey.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#5a5d66]"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-xl bg-[#e9ecef] px-4 py-4 text-[#191c1e] outline-none transition-all placeholder:text-[#8a8d95] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-xs font-bold uppercase tracking-[0.2em] text-[#5a5d66]"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="text-xs font-semibold text-[#008cc7] hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-xl bg-[#e9ecef] px-4 py-4 text-[#191c1e] outline-none transition-all placeholder:text-[#8a8d95] focus:bg-white focus:ring-2 focus:ring-[#008cc7]/30"
                            />
                        </div>

                        {/* Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#111c2d] py-4 font-semibold text-white transition-all hover:scale-[1.01] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                <span>Sign In</span>

                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </form>

                    {/* Signup */}
                    <div className="mt-8 text-center">
                        <p className="text-[#5a5d66]">
                            Don&apos;t have an account?
                            <Link
                                to="/register"
                                className="ml-1 font-bold text-black hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Secure */}
                    <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full bg-[#eef2f5] px-5 py-3">
                        <span
                            className="material-symbols-outlined text-[#008cc7]"
                            style={{
                                fontVariationSettings:
                                    '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
                            }}
                        >
                            verified_user
                        </span>

                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#004c6e]">
                            Secure Encrypted Session
                        </span>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Login