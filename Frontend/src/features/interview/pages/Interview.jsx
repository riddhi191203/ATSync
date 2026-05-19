import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { useInterview } from "../hooks/useInterview"
import { useAuth } from "../../auth/hooks/useAuth"
import { useSeo } from "../../../shared/seo/useSeo"

const FALLBACK_QUOTES = [
  {
    content:
      "Success is where preparation and opportunity meet.",
    author: "Bobby Unser",
  },
  {
    content:
      "Quality means doing it right when no one is looking.",
    author: "Henry Ford",
  },
  {
    content:
      "Well done is better than well said.",
    author: "Benjamin Franklin",
  },
]

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical",
    icon: "code",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: "forum",
  },
  {
    id: "roadmap",
    label: "Roadmap",
    icon: "route",
  },
]

const scoreTheme = (score) => {
  if (score >= 80)
    return {
      ring: "#10b981",
      badge:
        "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
      text: "Strong role compatibility",
    }

  if (score >= 60)
    return {
      ring: "#f59e0b",
      badge:
        "bg-amber-500/10 text-amber-300 border border-amber-500/20",
      text: "Good potential with improvements",
    }

  return {
    ring: "#f43f5e",
    badge:
      "bg-rose-500/10 text-rose-300 border border-rose-500/20",
    text: "More preparation required",
  }
}

const QuestionCard = ({
  item,
  index,
}) => {
  const [open, setOpen] =
    useState(false)

  return (
    <div className="border-b border-slate-800 last:border-none">
      <button
        onClick={() =>
          setOpen(!open)
        }
        className="group flex w-full items-start gap-4 py-5 text-left transition"
      >
        <span className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-300">
          Q{index + 1}
        </span>

        <p className="flex-1 text-[15px] leading-relaxed text-slate-100 transition group-hover:text-white">
          {item.question}
        </p>

        <span
          className={`material-symbols-outlined text-slate-500 transition ${
            open
              ? "rotate-180 text-sky-400"
              : ""
          }`}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="space-y-5 pb-6 pl-14">
          <div className="border-l-2 border-violet-500 pl-4">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-violet-300">
              Intention
            </span>

            <p className="text-sm leading-relaxed text-slate-400">
              {item.intention}
            </p>
          </div>

          <div className="border-l-2 border-emerald-500 pl-4">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-emerald-300">
              Model Answer
            </span>

            <p className="text-sm leading-relaxed text-slate-400">
              {item.answer}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const RoadmapDay = ({
  day,
}) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-2 h-3.5 w-3.5 rounded-full border-2 border-sky-500 bg-[#020617]" />

    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-gradient-to-b from-sky-500 to-transparent" />

    <div className="pb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[10px] uppercase tracking-widest text-sky-300">
          Day {day.day}
        </span>

        <h3 className="text-xl font-bold text-white">
          {day.focus}
        </h3>
      </div>

      <ul className="space-y-3">
        {day.tasks.map(
          (task, i) => (
            <li
              key={i}
              className="flex items-start gap-3"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-sky-400"></span>

              <span className="text-sm leading-relaxed text-slate-400">
                {task}
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  </div>
)

const Interview = () => {
  const { interviewId } =
    useParams()

  const navigate =
    useNavigate()

  const {
    report,
    getReportById,
    loading,
    getResumePdf,
  } = useInterview()

  const {
    user,
    handleLogout,
  } = useAuth()

  useSeo({
    title: "Interview Dashboard",
    description:
      "ATSync interview preparation dashboard with AI-generated interview questions and roadmap.",
    canonicalPath: `/interview/${interviewId}`,
    robots:
      "noindex,nofollow",
  })

  const [activeTab, setActiveTab] =
    useState("technical")

  const [quote, setQuote] =
    useState(
      FALLBACK_QUOTES[0]
    )

  const [quoteLoading, setQuoteLoading] =
    useState(false)

  const userMenuRef =
    useRef()

  const [
    isUserMenuOpen,
    setIsUserMenuOpen,
  ] = useState(false)

  useEffect(() => {
    if (interviewId) {
      getReportById(
        interviewId
      )
    }
  }, [interviewId])

  const fetchQuote =
    async () => {
      setQuoteLoading(true)

      try {
        const response =
          await fetch(
            "https://dummyjson.com/quotes/random"
          )

        const data =
          await response.json()

        setQuote({
          content:
            data.quote,
          author:
            data.author,
        })
      } catch {
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

  useEffect(() => {
    const handleOutside =
      (e) => {
        if (
          userMenuRef.current &&
          !userMenuRef.current.contains(
            e.target
          )
        ) {
          setIsUserMenuOpen(
            false
          )
        }
      }

    document.addEventListener(
      "mousedown",
      handleOutside
    )

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      )
  }, [])

  if (loading || !report) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-500 border-t-transparent"></div>

        <h1 className="mt-6 text-2xl font-bold text-white">
          ATSync AI is preparing
          your interview dashboard...
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Generating questions,
          skill gaps and roadmap.
        </p>
      </main>
    )
  }

  const score =
    scoreTheme(
      report.matchScore
    )

  const sections = {
    technical:
      report.technicalQuestions,
    behavioral:
      report.behavioralQuestions,
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <h1 className="text-2xl font-black tracking-tight">
              ATSync AI
            </h1>

            <div className="hidden items-center gap-6 md:flex">
              {NAV_ITEMS.map(
                (item) => (
                  <button
                    key={
                      item.id
                    }
                    onClick={() =>
                      setActiveTab(
                        item.id
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                      activeTab ===
                      item.id
                        ? "bg-sky-500/10 text-sky-300"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {
                        item.icon
                      }
                    </span>

                    {
                      item.label
                    }
                  </button>
                )
              )}
            </div>
          </div>

          {/* User */}
          <div
            className="relative"
            ref={userMenuRef}
          >
            <button
              onClick={() =>
                setIsUserMenuOpen(
                  !isUserMenuOpen
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 font-bold text-white"
            >
              {user?.username?.[0] ||
                "U"}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl">
                <div className="border-b border-slate-800 p-4">
                  <p className="text-sm font-semibold text-white">
                    {
                      user?.username
                    }
                  </p>
                </div>

                <button
                  onClick={
                    handleLogout
                  }
                  className="w-full px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-sky-400">
              Interview Dashboard
            </span>

            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-5xl font-black leading-tight tracking-tight md:text-6xl">
                {
                  report.title
                }
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
                AI-generated
                interview questions,
                preparation roadmap,
                and ATS insights for
                your target role.
              </p>
            </div>

            <button
              onClick={() =>
                getResumePdf(
                  interviewId
                )
              }
              className="rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
            >
              Download Resume PDF
            </button>
          </div>
        </section>

        {/* Layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="rounded-3xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
            {activeTab !==
            "roadmap" ? (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {
                      activeTab
                    }{" "}
                    Questions
                  </h2>

                  <span className="text-sm text-slate-500">
                    {
                      sections[
                        activeTab
                      ]
                        ?.length
                    }{" "}
                    questions
                  </span>
                </div>

                <div>
                  {sections[
                    activeTab
                  ]?.map(
                    (
                      item,
                      index
                    ) => (
                      <QuestionCard
                        key={
                          index
                        }
                        item={
                          item
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    Preparation
                    Roadmap
                  </h2>

                  <span className="text-sm text-slate-500">
                    {
                      report
                        .preparationPlan
                        ?.length
                    }{" "}
                    days
                  </span>
                </div>

                <div>
                  {report.preparationPlan?.map(
                    (
                      day
                    ) => (
                      <RoadmapDay
                        key={
                          day.day
                        }
                        day={
                          day
                        }
                      />
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Match Score */}
            <section className="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Match Score
                </h3>

                <span className="text-sm text-slate-500">
                  ATS
                </span>
              </div>

              <div className="mb-6 flex items-center gap-5">
                <div className="relative h-24 w-24">
                  <svg
                    viewBox="0 0 100 100"
                    className="-rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />

                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={
                        score.ring
                      }
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${
                        (report.matchScore /
                          100) *
                        264
                      } 264`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white">
                      {
                        report.matchScore
                      }
                      %
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${score.badge}`}
                >
                  {
                    score.text
                  }
                </div>
              </div>
            </section>

            {/* Skill Gaps */}
            <section className="rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Skill Gaps
                </h3>

                <span className="text-sm text-slate-500">
                  {
                    report
                      .skillGaps
                      ?.length
                  }{" "}
                  gaps
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {report.skillGaps?.map(
                  (
                    gap,
                    i
                  ) => (
                    <span
                      key={
                        i
                      }
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300"
                    >
                      {
                        gap.skill
                      }
                    </span>
                  )
                )}
              </div>
            </section>

            {/* Quote */}
            <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500"></div>

              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-sky-400">
                  AI Insight
                </span>

                <button
                  onClick={
                    fetchQuote
                  }
                  disabled={
                    quoteLoading
                  }
                  className="text-sm text-slate-500 transition hover:text-white"
                >
                  {quoteLoading
                    ? "Loading..."
                    : "Refresh"}
                </button>
              </div>

              <p className="text-lg leading-relaxed text-slate-200">
                "
                {
                  quote.content
                }
                "
              </p>

              <p className="mt-5 text-sm text-slate-500">
                —{" "}
                {
                  quote.author
                }
              </p>
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

export default Interview