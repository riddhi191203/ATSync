import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useAuth } from "../hooks/useAuth"
import { useSeo } from "../../../shared/seo/useSeo"

const Register = () => {
    useSeo({
        title: "Create Account",
        description:
            "Create your ATSync account and unlock AI-powered resume analysis, ATS scoring, skill-gap detection, and interview preparation tools.",
        canonicalPath: "/register",
        keywords: [
            "ATSync register",
            "AI resume analyser",
            "ATS resume checker",
            "resume optimization",
            "AI interview preparation",
            "career growth platform",
        ],
        robots: "index,follow",
        ogType: "website",
    })

    const { loading, handleRegister } = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await handleRegister({
                username,
                email,
                password,
            })

            navigate("/")
        } catch (error) {
            console.error(error)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6">
                <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border border-slate-800 bg-[#0f172a] px-8 py-10 shadow-2xl">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />

                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">
                            Creating Account
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            Preparing your ATSync AI workspace...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex min-h-screen overflow-hidden bg-[#020617] text-white">
            {/* LEFT PANEL */}
            <section className="relative hidden w-[58%] overflow-hidden lg:flex">
                {/* Background */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                        alt="Modern Workspace"
                        className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-[#020617]/80" />

                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-violet-500/10" />
                </div>

                {/* Content */}
                <div className="relative z-20 flex h-full flex-col justify-between p-14">
                    <Link
                        to="/"
                        className="text-4xl font-black tracking-tight text-white"
                    >
                        ATSync AI
                    </Link>

                    <div className="max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
                            <span className="material-symbols-outlined text-[18px]">
                                psychology
                            </span>

                            AI-Powered Career Intelligence
                        </div>

                        <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-white">
                            Build Smarter Careers With ATSync AI
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                            Analyze resumes, improve ATS scores, discover missing
                            skills, and prepare for interviews with intelligent
                            AI-powered career insights.
                        </p>

                        {/* Stats */}
                        <div className="mt-10 flex flex-wrap gap-4">
                            <div className="rounded-2xl border border-slate-800 bg-white/5 px-5 py-4 backdrop-blur-xl">
                                <p className="text-3xl font-black text-white">
                                    AI
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Resume Analysis
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-white/5 px-5 py-4 backdrop-blur-xl">
                                <p className="text-3xl font-black text-white">
                                    ATS
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Score Optimization
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-800 bg-white/5 px-5 py-4 backdrop-blur-xl">
                                <p className="text-3xl font-black text-white">
                                    Smart
                                </p>

                                <p className="mt-1 text-sm text-slate-400">
                                    Interview Preparation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="mb-10">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-300">
                            Create Account
                        </div>

                        <h2 className="text-4xl font-black tracking-tight text-white">
                            Join ATSync AI
                        </h2>

                        <p className="mt-3 text-slate-400">
                            Start your AI-powered career journey today.
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="fullname"
                                className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                                Full Name
                            </label>

                            <input
                                id="fullname"
                                type="text"
                                placeholder="John Doe"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/10"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                                Email Address
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/10"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                className="w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/10"
                            />
                        </div>

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-500 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            <span>Create Account</span>

                            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                                arrow_forward
                            </span>
                        </button>
                    </form>

                    {/* LOGIN */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-400">
                            Already have an account?
                            <Link
                                to="/login"
                                className="ml-2 font-semibold text-sky-400 hover:text-sky-300"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>

                    {/* SECURITY */}
                    <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4">
                        <span
                            className="material-symbols-outlined text-sky-400"
                            style={{
                                fontVariationSettings:
                                    '"FILL" 1, "wght" 400, "GRAD" 0, "opsz" 24',
                            }}
                        >
                            verified_user
                        </span>

                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Secure Encrypted Session
                        </span>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Register