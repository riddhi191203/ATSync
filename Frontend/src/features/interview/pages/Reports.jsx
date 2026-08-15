import React, { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useInterview } from "../hooks/useInterview"
import { useAuth } from "../../auth/hooks/useAuth"
import { useSeo } from "../../../shared/seo/useSeo"

const Reports = () => {
    useSeo({
        title: "All Reports",
        description: "Explore all your generated AI resume analysis reports and ATS scores.",
        canonicalPath: "/reports",
        robots: "noindex,nofollow",
    })

    const navigate = useNavigate()
    const { user, handleLogout } = useAuth()
    const { reports, loading } = useInterview()

    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("newest") // newest, oldest, score-desc, score-asc
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const filteredReports = (reports || [])
        .filter((report) => {
            const query = searchQuery.toLowerCase()
            return (
                report?.title?.toLowerCase().includes(query) ||
                report?.company?.toLowerCase().includes(query)
            )
        })
        .sort((a, b) => {
            if (sortBy === "newest") {
                return new Date(b.createdAt) - new Date(a.createdAt)
            }
            if (sortBy === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt)
            }
            if (sortBy === "score-desc") {
                return (b.matchScore || 0) - (a.matchScore || 0)
            }
            if (sortBy === "score-asc") {
                return (a.matchScore || 0) - (b.matchScore || 0)
            }
            return 0
        })

    const getScoreColor = (score) => {
        if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        if (score >= 60) return "text-amber-400 bg-amber-500/10 border-amber-500/20"
        return "text-rose-400 bg-rose-500/10 border-rose-500/20"
    }

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6">
                <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">Loading reports...</h1>
                </div>
            </main>
        )
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col justify-between">
            <div>
                {/* Navbar */}
                <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-10">
                            <Link to="/" className="text-2xl font-bold tracking-tight text-white cursor-pointer">
                                ATSync
                            </Link>
                            <div className="hidden items-center gap-6 md:flex">
                                <Link to="/" className="text-sm text-slate-400 transition hover:text-white cursor-pointer">
                                    Dashboard
                                </Link>
                                <Link to="/reports" className="text-sm font-semibold text-sky-400 cursor-pointer">
                                    Reports
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="hidden rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 md:block"
                            />

                            {/* User */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                                    {user?.username?.[0] || "U"}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="hidden rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white md:block cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>

                            {/* Hamburger Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-[#0f172a] text-slate-300 transition hover:border-slate-600 md:hidden cursor-pointer"
                            >
                                <span className="material-symbols-outlined">
                                    {isMobileMenuOpen ? "close" : "menu"}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Drawer */}
                    {isMobileMenuOpen && (
                        <div className="border-t border-slate-800 bg-[#020617] px-6 py-4 space-y-4 md:hidden animate-fade-up">
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white w-full"
                                >
                                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                    Dashboard
                                </Link>
                                <Link
                                    to="/reports"
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-sky-400 hover:bg-slate-800 w-full"
                                >
                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                    Reports
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-rose-400 hover:bg-rose-500/10 w-full cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Logout ({user?.username})
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Main Content */}
                <main className="mx-auto max-w-7xl px-6 py-10">
                    <section className="mb-10">
                        <div className="mb-4 flex items-center gap-3">
                            <span className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                                History
                            </span>
                            <div className="h-px flex-1 bg-slate-800"></div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                                    All Reports
                                </h1>
                                <p className="mt-2 text-slate-400 max-w-xl">
                                    Browse, filter, and review all AI-powered ATS resume analysis and preparation roadmaps you have generated.
                                </p>
                            </div>

                            {/* Back Button */}
                            <Link
                                to="/"
                                className="self-start md:self-auto flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#0f172a] px-5 py-3 text-sm text-slate-300 transition hover:border-slate-600 hover:text-white"
                            >
                                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                                Back to Dashboard
                            </Link>
                        </div>
                    </section>

                    {/* Filter and Sort bar */}
                    <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                        <div className="flex-1 max-w-md relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
                            <input
                                type="text"
                                placeholder="Search by role or company..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-[#020617] pl-10 pr-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <label htmlFor="sort" className="text-xs font-bold uppercase tracking-wider text-slate-500">Sort By:</label>
                            <select
                                id="sort"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="rounded-xl border border-slate-700 bg-[#020617] px-4 py-2 text-sm text-white outline-none focus:border-sky-500 cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="score-desc">Highest Match Score</option>
                                <option value="score-asc">Lowest Match Score</option>
                            </select>
                        </div>
                    </div>

                    {/* Reports Grid */}
                    {filteredReports.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredReports.map((report) => (
                                <div
                                    key={report._id}
                                    onClick={() => navigate(`/interview/${report._id}`)}
                                    className="group cursor-pointer rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/40 hover:shadow-2xl"
                                >
                                    <div className="mb-4 flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition line-clamp-1">
                                                {report.title || "Untitled Role"}
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                                {report.company || "Not specified"}
                                            </p>
                                        </div>

                                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${getScoreColor(report.matchScore)}`}>
                                            {report.matchScore || 0}%
                                        </span>
                                    </div>

                                    <div className="mb-5 flex flex-wrap gap-2">
                                        {report.skillGaps && report.skillGaps.length > 0 ? (
                                            report.skillGaps.slice(0, 3).map((gap, i) => (
                                                <span key={i} className="rounded-lg bg-[#020617] border border-slate-800 px-2.5 py-1 text-[10px] text-slate-400">
                                                    {gap.skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded-lg px-2.5 py-1">All Skills Match</span>
                                        )}
                                        {report.skillGaps && report.skillGaps.length > 3 && (
                                            <span className="rounded-lg bg-[#020617] border border-slate-800 px-2 py-1 text-[10px] text-slate-500">
                                                +{report.skillGaps.length - 3} more
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span className="font-semibold text-sky-400 group-hover:underline flex items-center gap-0.5">
                                            Review details
                                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-slate-800 p-12 text-center max-w-md mx-auto space-y-4">
                            <span className="material-symbols-outlined text-5xl text-slate-600">folder_open</span>
                            <h3 className="text-xl font-bold text-white">No Reports Found</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                {searchQuery ? "No reports match your search query. Try adjusting your terms." : "You haven't generated any resume analysis reports yet. Upload a resume to get started!"}
                            </p>
                            {!searchQuery && (
                                <Link to="/" className="inline-flex rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-400">
                                    Analyze Resume
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-slate-800 py-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
                    <span className="text-lg font-bold text-white">
                        ATSync AI
                    </span>
                    <span className="text-sm text-slate-500">
                        © 2026 ATSync AI
                    </span>
                </div>
            </footer>
        </div>
    )
}

export default Reports
