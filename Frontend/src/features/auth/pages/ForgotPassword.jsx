import React, { useState } from "react"
import { Link } from "react-router"
import { forgotPassword } from "../services/auth.api"
import { useSeo } from "../../../shared/seo/useSeo"

const ForgotPassword = () => {
    useSeo({
        title: "Forgot Password",
        description: "Request a password reset link for your ATSync AI account.",
        canonicalPath: "/forgot-password",
        robots: "noindex,nofollow",
    })

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [testResetLink, setTestResetLink] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccessMsg("")
        setTestResetLink("")

        try {
            const data = await forgotPassword({ email })
            setSuccessMsg("A password reset link has been generated.")
            if (data.resetLink) {
                const url = new URL(data.resetLink)
                setTestResetLink(url.pathname)
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to generate password reset request.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen overflow-hidden bg-[#020617] text-white">
            {/* LEFT PANEL */}
            <section className="relative hidden w-[58%] overflow-hidden lg:flex">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                        alt="Workspace"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#020617]/80" />
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-violet-500/10" />
                </div>

                <div className="relative z-20 flex h-full flex-col justify-between p-14">
                    <Link to="/" className="text-4xl font-black tracking-tight text-white">
                        ATSync AI
                    </Link>

                    <div className="max-w-2xl">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
                            <span className="material-symbols-outlined text-[18px]">
                                lock_reset
                            </span>
                            Account Recovery
                        </div>
                        <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-white">
                            Recover Your Account Access
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                            Provide your registered email address, and we will help you establish a new secure login.
                        </p>
                    </div>
                </div>
            </section>

            {/* RIGHT PANEL */}
            <section className="flex flex-1 items-center justify-center px-6 py-10 lg:px-12">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-8 lg:hidden">
                        <Link to="/" className="text-3xl font-black tracking-tight text-white">
                            ATSync AI
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-10">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sky-300">
                            Reset Password
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white">
                            Forgot Password?
                        </h2>
                        <p className="mt-3 text-slate-400">
                            Enter your email below and we'll help you reset your password.
                        </p>
                    </div>

                    {successMsg ? (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-300">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[24px]">check_circle</span>
                                    <span className="font-semibold">{successMsg}</span>
                                </div>
                            </div>

                            {testResetLink && (
                                <div className="rounded-2xl border border-sky-500/30 bg-[#0f172a] p-6 space-y-4 shadow-2xl">
                                    <div className="flex items-center gap-2 text-sky-400">
                                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                                        <span className="text-xs font-bold uppercase tracking-wider">Dev Test Assistance</span>
                                    </div>
                                    <p className="text-sm text-slate-300">
                                        Since no SMTP email server is configured in development, you can reset your password directly by clicking below:
                                    </p>
                                    <Link
                                        to={testResetLink}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 font-semibold text-white transition hover:bg-sky-400"
                                    >
                                        <span>Proceed to Reset Password</span>
                                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </Link>
                                </div>
                            )}

                            <div className="text-center">
                                <Link to="/login" className="text-sm font-semibold text-sky-400 hover:text-sky-300">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="email" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/10"
                                />
                            </div>

                            {error && (
                                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-sky-500 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                <span>{loading ? "Generating Link..." : "Send Reset Link"}</span>
                                {!loading && (
                                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                                        arrow_forward
                                    </span>
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300">
                                    Return to Sign In
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ForgotPassword
