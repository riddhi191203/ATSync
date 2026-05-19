import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { useInterview } from "../hooks/useInterview"
import { useAuth } from "../../auth/hooks/useAuth"
import { useSeo } from "../../../shared/seo/useSeo"

const FALLBACK_QUOTES = [
  {
    content: "Success is where preparation and opportunity meet.",
    author: "Bobby Unser",
  },
  {
    content: "Well done is better than well said.",
    author: "Benjamin Franklin",
  },
  {
    content: "Quality means doing it right when no one is looking.",
    author: "Henry Ford",
  },
]

const Home = () => {
  useSeo({
    title: "ATSync Dashboard",
    description:
      "AI-powered ATS resume analysis, interview preparation, and skill-gap detection platform.",
    canonicalPath: "/",
    keywords: [
      "ATSync",
      "AI resume analyser",
      "ATS score",
      "resume analysis",
      "interview prep",
    ],
    robots: "index,follow",
    ogType: "website",
  })

  const navigate = useNavigate()

  const { user, handleLogout } = useAuth()

  const { loading, generateReport, reports } =
    useInterview()

  const resumeInputRef = useRef()

  const [jobDescription, setJobDescription] =
    useState("")

  const [selfDescription, setSelfDescription] =
    useState("")

  const [searchQuery, setSearchQuery] = useState("")

  const [submitError, setSubmitError] = useState("")

  const [quote, setQuote] = useState(
    FALLBACK_QUOTES[0]
  )

  const [quoteLoading, setQuoteLoading] =
    useState(false)

  const filteredReports = (reports || []).filter(
    (report) => {
      const query = searchQuery.toLowerCase()

      return (
        report?.title
          ?.toLowerCase()
          .includes(query) ||
        report?.company
          ?.toLowerCase()
          .includes(query)
      )
    }
  )

  const fetchQuote = async () => {
    setQuoteLoading(true)

    try {
      const response = await fetch(
        "https://dummyjson.com/quotes/random"
      )

      const data = await response.json()

      setQuote({
        content:
          data?.quote ||
          FALLBACK_QUOTES[0].content,
        author:
          data?.author ||
          FALLBACK_QUOTES[0].author,
      })
    } catch (error) {
      const random =
        FALLBACK_QUOTES[
          Math.floor(
            Math.random() *
              FALLBACK_QUOTES.length
          )
        ]

      setQuote(random)
    } finally {
      setQuoteLoading(false)
    }
  }

  useEffect(() => {
    fetchQuote()
  }, [])

  const handleGenerateReport = async () => {
    const resumeFile =
      resumeInputRef.current?.files?.[0]

    setSubmitError("")

    if (!jobDescription.trim()) {
      setSubmitError(
        "Job description is required."
      )
      return
    }

    if (
      !resumeFile &&
      !selfDescription.trim()
    ) {
      setSubmitError(
        "Upload a resume or provide a candidate summary."
      )
      return
    }

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      })

      if (data?._id) {
        navigate(`/interview/${data._id}`)
      }
    } catch (error) {
      setSubmitError(
        error.message ||
          "Unable to generate report."
      )
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          ATSync AI is analyzing your
          resume...
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Generating ATS score and
          interview insights.
        </p>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              ATSync
            </h1>

            <div className="hidden items-center gap-6 md:flex">
              <button className="text-sm font-semibold text-sky-400">
                Dashboard
              </button>

              <button className="text-sm text-slate-400 transition hover:text-white">
                Reports
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="hidden rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500 md:block"
            />

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-bold text-white">
                {user?.username?.[0] || "U"}
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 bg-[#0f172a] px-4 py-2 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-widest text-sky-400">
              ATSync Dashboard
            </span>

            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-black leading-tight tracking-tight text-white md:text-6xl">
                Analyze Your <br />
                Resume With AI.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
                Get ATS scores,
                skill-gap analysis,
                interview preparation,
                and AI-powered career
                insights instantly.
              </p>
            </div>

            {/* Quote */}
            <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-widest text-sky-400">
                  AI Insight
                </span>

                <button
                  onClick={fetchQuote}
                  disabled={quoteLoading}
                  className="text-sm font-medium text-slate-400 hover:text-white"
                >
                  {quoteLoading
                    ? "Loading..."
                    : "Refresh"}
                </button>
              </div>

              <p className="text-lg leading-relaxed text-slate-200">
                "{quote.content}"
              </p>

              <p className="mt-4 text-sm text-slate-500">
                — {quote.author}
              </p>
            </div>
          </div>
        </section>

        {/* Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Left */}
          <div>
            {/* Job Description */}
            <section className="mb-8 rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Job Description
                </h2>

                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase text-sky-400">
                  Required
                </span>
              </div>

              <textarea
                rows={10}
                value={jobDescription}
                onChange={(e) =>
                  setJobDescription(
                    e.target.value
                  )
                }
                placeholder="Paste job description here..."
                className="w-full rounded-2xl border border-slate-700 bg-[#020617] p-5 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
              />

              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>
                  Plain text supported
                </span>

                <span>
                  {
                    jobDescription.length
                  }{" "}
                  chars
                </span>
              </div>
            </section>

            {/* Resume */}
            <section className="rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Upload Resume
              </h2>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700 bg-[#020617] p-12 transition hover:border-sky-500 hover:bg-slate-900">
                <span className="material-symbols-outlined mb-4 text-5xl text-sky-400">
                  upload_file
                </span>

                <p className="font-semibold text-white">
                  {resumeInputRef.current
                    ?.files?.[0]?.name ||
                    "Upload PDF Resume"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  PDF only • Max 5MB
                </p>

                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                />
              </label>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-800"></div>

                <span className="text-xs uppercase text-slate-500">
                  OR
                </span>

                <div className="h-px flex-1 bg-slate-800"></div>
              </div>

              <input
                type="text"
                value={selfDescription}
                onChange={(e) =>
                  setSelfDescription(
                    e.target.value
                  )
                }
                placeholder="Quick candidate summary..."
                className="w-full rounded-2xl border border-slate-700 bg-[#020617] p-4 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
              />

              {submitError && (
                <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                  {submitError}
                </div>
              )}

              <button
                onClick={
                  handleGenerateReport
                }
                className="mt-8 w-full rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 hover:bg-sky-400"
              >
                Analyze Resume →
              </button>
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            <section className="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">
                  Recent Reports
                </h3>

                <span className="text-sm text-slate-500">
                  {
                    filteredReports.length
                  }{" "}
                  items
                </span>
              </div>

              <div className="space-y-4">
                {filteredReports.length >
                0 ? (
                  filteredReports.map(
                    (report) => (
                      <div
                        key={
                          report._id
                        }
                        onClick={() =>
                          navigate(
                            `/interview/${report._id}`
                          )
                        }
                        className="cursor-pointer rounded-2xl border border-slate-700 bg-[#020617] p-4 transition hover:border-sky-500"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="font-semibold text-white">
                            {report.title ||
                              "Untitled"}
                          </h4>

                          <span className="rounded-full bg-sky-500/10 px-2 py-1 text-xs font-bold text-sky-400">
                            {report.matchScore ||
                              0}
                            %
                          </span>
                        </div>

                        <p className="text-xs text-slate-500">
                          {new Date(
                            report.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
                    No reports generated
                    yet.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>

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

export default Home