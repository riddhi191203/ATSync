import React, { useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { resetPassword } from "../services/auth.api"
import { useSeo } from "../../../shared/seo/useSeo"

const ResetPassword = () => {
    useSeo({
        title: "Reset Password",
        description: "Establish a new secure password for your ATSync AI account.",
        canonicalPath: "/reset-password",
        robots: "noindex,nofollow",
    })

    const { userId, token } = useParams()
    const navigate = useNavigate()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        setError("")
        setSuccessMsg("")

        try {
            await resetPassword({ userId, token, newPassword: password })
            setSuccessMsg("Password reset successfully! Redirecting you to login page...")
            setTimeout(() => {
                navigate("/login")
            }, 3000)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. The link might be invalid or expired.")
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
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
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
                                key
                            </span>
                            Password Configuration
                        </div>
                        <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-white">
                            Establish a New Secure Password
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                            Input a new combination of characters to protect your account. Make sure it is strong and easy to recall.
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
                            New Password
                        </div>
                        <h2 className="text-4xl font-black tracking-tight text-white">
                            Create New Password
                        </h2>
                        <p className="mt-3 text-slate-400">
                            Enter and confirm your new secure account password below.
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
                            <Link
                                to="/login"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-4 font-semibold text-white shadow-lg transition hover:bg-sky-400"
                            >
                                <span>Go to Login Immediately</span>
                                <span className="material-symbols-outlined text-[18px]">login</span>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Password */}
                            <div>
                                <label htmlFor="pass" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    New Password
                                </label>
                                <input
                                    id="pass"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 text-white outline-none transition-all placeholder:text-slate-500 focus:border-sky-500/40 focus:ring-4 focus:ring-sky-500/10"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm" className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirm"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                                <span>{loading ? "Resetting Password..." : "Update Password"}</span>
                                {!loading && (
                                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">
                                        arrow_forward
                                    </span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ResetPassword
