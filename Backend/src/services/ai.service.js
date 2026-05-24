const { GoogleGenAI } = require("@google/genai")
const fs = require("fs")
const path = require("path")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

process.env.PUPPETEER_CACHE_DIR = process.env.PUPPETEER_CACHE_DIR
    || path.join(__dirname, "..", "..", ".cache", "puppeteer")

const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const ALLOWED_ROADMAP_DAYS = [7, 25, 45, 60]
const ALLOWED_QUESTION_COUNTS = [10, 15, 20]

const normalizeOption = (value, allowedValues, fallback) => {
    const numericValue = Number(value)
    return allowedValues.includes(numericValue) ? numericValue : fallback
}

const fillQuestion = (questionType, index) => ({
    question: `Sample ${questionType} question ${index + 1}`,
    intention: `Assess ${questionType.toLowerCase()} readiness for this role.`,
    answer: "Provide a concise, role-relevant answer with concrete examples."
})

const ensureQuestionLength = (questions, targetCount, questionType) => {
    const safeQuestions = Array.isArray(questions) ? [...questions] : []
    const trimmed = safeQuestions.slice(0, targetCount)

    while (trimmed.length < targetCount) {
        trimmed.push(fillQuestion(questionType, trimmed.length))
    }

    return trimmed
}

const ensureRoadmapLength = (plan, targetDays) => {
    const safePlan = Array.isArray(plan) ? [...plan] : []

    const trimmed = safePlan.slice(0, targetDays).map((item, index) => ({
        day: index + 1,
        focus: item?.focus || `Preparation focus for day ${index + 1}`,
        tasks:
            Array.isArray(item?.tasks) && item.tasks.length > 0
                ? item.tasks
                : [
                    "Review role requirements and identify weak areas.",
                    "Practice role-specific questions and refine responses.",
                    "Summarize key learnings and plan next-day priorities."
                ]
    }))

    while (trimmed.length < targetDays) {
        const day = trimmed.length + 1

        trimmed.push({
            day,
            focus: `Preparation focus for day ${day}`,
            tasks: [
                "Review role requirements and identify weak areas.",
                "Practice role-specific questions and refine responses.",
                "Summarize key learnings and plan next-day priorities."
            ]
        })
    }

    return trimmed
}

const chromeExecutableCandidates = () => [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.GOOGLE_CHROME_BIN,
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium"
].filter(Boolean)

const resolveChromeExecutablePath = () => {
    const installedBrowserPath = chromeExecutableCandidates().find((candidate) =>
        fs.existsSync(candidate)
    )

    if (installedBrowserPath) {
        return installedBrowserPath
    }

    try {
        const bundledBrowserPath = puppeteer.executablePath()

        return fs.existsSync(bundledBrowserPath) ? bundledBrowserPath : undefined
    } catch (error) {
        return undefined
    }
}

const buildPuppeteerLaunchOptions = () => {
    const executablePath = resolveChromeExecutablePath()

    return {
        headless: true,
        ...(executablePath ? { executablePath } : {}),

        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-zygote",
            "--disable-extensions"
        ]
    }
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe(
        "A score between 0 and 100 indicating how well the candidate's profile matches the job describe"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe("The technical question can be asked in the interview"),
            intention: z.string().describe("The intention of interviewer behind asking this question"),
            answer: z.string().describe(
                "How to answer this question, what points to cover, what approach to take etc."
            )
        })
    ).describe(
        "Technical questions that can be asked in the interview along with their intention and how to answer them"
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe("The technical question can be asked in the interview"),
            intention: z.string().describe("The intention of interviewer behind asking this question"),
            answer: z.string().describe(
                "How to answer this question, what points to cover, what approach to take etc."
            )
        })
    ).describe(
        "Behavioral questions that can be asked in the interview along with their intention and how to answer them"
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string().describe("The skill which the candidate is lacking"),

            severity: z.enum(["low", "medium", "high"]).describe(
                "The severity of this skill gap"
            )
        })
    ).describe("List of skill gaps in the candidate's profile"),

    preparationPlan: z.array(
        z.object({
            day: z.number().describe("The day number in the preparation plan"),
            focus: z.string().describe("The main focus of this day"),
            tasks: z.array(z.string()).describe("List of tasks")
        })
    ).describe("A day-wise preparation plan"),

    title: z.string().describe("The title of the job")
})

async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription,
    roadmapDays,
    technicalQuestionCount,
    behavioralQuestionCount
}) {

    const targetRoadmapDays = normalizeOption(
        roadmapDays,
        ALLOWED_ROADMAP_DAYS,
        25
    )

    const targetTechnicalQuestions = normalizeOption(
        technicalQuestionCount,
        ALLOWED_QUESTION_COUNTS,
        15
    )

    const targetBehavioralQuestions = normalizeOption(
        behavioralQuestionCount,
        ALLOWED_QUESTION_COUNTS,
        15
    )

    const prompt = `
        Generate an interview report for a candidate with the following details:

        Resume: ${resume}

        Self Description: ${selfDescription}

        Job Description: ${jobDescription}

        Output requirements:
        - Return exactly ${targetTechnicalQuestions} items in technicalQuestions.
        - Return exactly ${targetBehavioralQuestions} items in behavioralQuestions.
        - Return exactly ${targetRoadmapDays} items in preparationPlan.
        - preparationPlan day values must be sequential integers starting at 1.
        - Ensure all arrays are complete and match these exact counts.
    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    })

    const report = JSON.parse(response.text)

    report.technicalQuestions = ensureQuestionLength(
        report.technicalQuestions,
        targetTechnicalQuestions,
        "Technical"
    )

    report.behavioralQuestions = ensureQuestionLength(
        report.behavioralQuestions,
        targetBehavioralQuestions,
        "Behavioral"
    )

    report.preparationPlan = ensureRoadmapLength(
        report.preparationPlan,
        targetRoadmapDays
    )

    return report
}

async function generatePdfFromHtml(htmlContent) {

    let browser = null

    try {

        browser = await puppeteer.launch(buildPuppeteerLaunchOptions())

        const page = await browser.newPage()

        await page.setContent(htmlContent, {
            waitUntil: ["domcontentloaded", "networkidle0"],
            timeout: 30000
        })

        const pdfBuffer = await page.pdf({
            format: "A4",

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            },

            printBackground: true
        })

        return pdfBuffer

    } catch (error) {

        console.error("PDF Generation Error:", error)

        if (/Could not find Chrome|Browser was not found/i.test(error.message)) {
            throw new Error(
                `Chrome is not installed for Puppeteer. Run "npm install" in the Backend directory during deployment so the postinstall script can download Chrome into ${process.env.PUPPETEER_CACHE_DIR}. If this is running on Render, make sure the service root directory is Backend and the build command runs npm install without PUPPETEER_SKIP_DOWNLOAD=true. Original error: ${error.message}`
            )
        }

        throw error

    } finally {

        if (browser) {
            await browser.close().catch((error) => {
                console.error("Failed to close Puppeteer browser:", error)
            })
        }
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const resumePdfSchema = z.object({
        html: z.string().describe(
            "The HTML content of the resume"
        )
    })

    const prompt = `
        Generate resume for a candidate with the following details:

        Resume: ${resume}

        Self Description: ${selfDescription}

        Job Description: ${jobDescription}

        The response should be a JSON object with a single field "html".

        The resume should:
        - Be ATS friendly
        - Be professional
        - Be visually clean
        - Be 1-2 pages long
        - Highlight relevant strengths
        - Sound human written
    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema)
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}
