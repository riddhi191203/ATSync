import { useEffect } from "react"

const SITE_NAME = "ATSync - AI Resume Analyser"

const DEFAULT_TITLE =
  "AI Resume Analysis, ATS Scoring & Interview Preparation"

const DEFAULT_DESCRIPTION =
  "ATSync helps you optimize your resume with AI-powered ATS scoring, resume analysis, skill-gap detection, and personalized interview preparation."

const FALLBACK_SITE_URL = "http://localhost:5173"

const normalizeSiteUrl = (url) =>
  (url || FALLBACK_SITE_URL).replace(/\/+$/, "")

const toAbsoluteUrl = (path = "/") => {
  const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL)
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`

  return `${siteUrl}${normalizedPath}`
}

const upsertMeta = (selector, attributes, content) => {
  if (!content) return

  let tag = document.head.querySelector(selector)

  if (!tag) {
    tag = document.createElement("meta")

    Object.entries(attributes).forEach(([key, value]) =>
      tag.setAttribute(key, value)
    )

    document.head.appendChild(tag)
  }

  tag.setAttribute("content", content)
}

const upsertCanonical = (href) => {
  let link = document.head.querySelector(
    "link[rel='canonical']"
  )

  if (!link) {
    link = document.createElement("link")
    link.setAttribute("rel", "canonical")
    document.head.appendChild(link)
  }

  link.setAttribute("href", href)
}

const upsertJsonLd = (jsonLd) => {
  const id = "seo-json-ld"

  let script = document.getElementById(id)

  if (!script) {
    script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"

    document.head.appendChild(script)
  }

  script.textContent = JSON.stringify(jsonLd)
}

export const useSeo = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  canonicalUrl,
  robots = "index,follow",
  keywords = [],
  ogType = "website",
  imagePath = "/favicon.png",
  jsonLd,
}) => {
  useEffect(() => {
    const finalTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${DEFAULT_TITLE} | ${SITE_NAME}`

    const derivedPath =
      canonicalPath || window.location.pathname || "/"

    const finalCanonicalUrl =
      canonicalUrl || toAbsoluteUrl(derivedPath)

    const finalImageUrl = imagePath.startsWith("http")
      ? imagePath
      : toAbsoluteUrl(imagePath)

    const keywordText = Array.isArray(keywords)
      ? keywords.join(", ")
      : keywords

    document.title = finalTitle

    upsertCanonical(finalCanonicalUrl)

    upsertMeta(
      "meta[name='description']",
      { name: "description" },
      description
    )

    upsertMeta(
      "meta[name='robots']",
      { name: "robots" },
      robots
    )

    upsertMeta(
      "meta[name='keywords']",
      { name: "keywords" },
      keywordText
    )

    // Open Graph
    upsertMeta(
      "meta[property='og:title']",
      { property: "og:title" },
      finalTitle
    )

    upsertMeta(
      "meta[property='og:description']",
      { property: "og:description" },
      description
    )

    upsertMeta(
      "meta[property='og:type']",
      { property: "og:type" },
      ogType
    )

    upsertMeta(
      "meta[property='og:url']",
      { property: "og:url" },
      finalCanonicalUrl
    )

    upsertMeta(
      "meta[property='og:site_name']",
      { property: "og:site_name" },
      SITE_NAME
    )

    upsertMeta(
      "meta[property='og:image']",
      { property: "og:image" },
      finalImageUrl
    )

    // Twitter
    upsertMeta(
      "meta[name='twitter:card']",
      { name: "twitter:card" },
      "summary_large_image"
    )

    upsertMeta(
      "meta[name='twitter:title']",
      { name: "twitter:title" },
      finalTitle
    )

    upsertMeta(
      "meta[name='twitter:description']",
      { name: "twitter:description" },
      description
    )

    upsertMeta(
      "meta[name='twitter:image']",
      { name: "twitter:image" },
      finalImageUrl
    )

    // Structured Data
    if (jsonLd) {
      upsertJsonLd(jsonLd)
    }
  }, [
    title,
    description,
    canonicalPath,
    canonicalUrl,
    robots,
    keywords,
    ogType,
    imagePath,
    jsonLd,
  ])
}