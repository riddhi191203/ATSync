const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const ALLOWED_ROADMAP_DAYS = [7, 25, 45, 60]
const ALLOWED_QUESTION_COUNTS = [10, 15, 20]

const normalizeOption = (value, allowedValues, fallback) => {
    const numericValue = Number(value)
    return allowedValues.includes(numericValue)
        ? numericValue
        : fallback
}

const fillQuestion = (questionType, index) => ({
    question: `Sample ${questionType} question ${index + 1}`,
    intention: `Assess ${questionType.toLowerCase()} readiness for this role.`,
    answer: "Provide a concise, role-relevant answer with concrete examples."
})

const ensureQuestionLength = (
    questions,
    targetCount,
    questionType
) => {

    const safeQuestions = Array.isArray(questions)
        ? [...questions]
        : []

    const trimmed = safeQuestions.slice(0, targetCount)

    while (trimmed.length < targetCount) {
        trimmed.push(
            fillQuestion(questionType, trimmed.length)
        )
    }

    return trimmed
}

const ensureRoadmapLength = (plan, targetDays) => {

    const safePlan = Array.isArray(plan)
        ? [...plan]
        : []

    const trimmed = safePlan
        .slice(0, targetDays)
        .map((item, index) => ({
            day: index + 1,

            focus:
                item?.focus ||
                `Preparation focus for day ${index + 1}`,

            tasks:
                Array.isArray(item?.tasks) &&
                item.tasks.length > 0
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

const interviewReportSchema = z.object({

    matchScore: z.number().describe(
        "A score between 0 and 100"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string(),
            intention: z.string(),
            answer: z.string()
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string(),

            severity: z.enum([
                "low",
                "medium",
                "high"
            ])
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number(),
            focus: z.string(),
            tasks: z.array(z.string())
        })
    ),

    title: z.string()
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
        Generate an interview report.

        Resume:
        ${resume}

        Self Description:
        ${selfDescription}

        Job Description:
        ${jobDescription}

        Requirements:
        - ${targetTechnicalQuestions} technical questions
        - ${targetBehavioralQuestions} behavioral questions
        - ${targetRoadmapDays} roadmap days
    `

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",
            responseSchema:
                zodToJsonSchema(interviewReportSchema)
        }
    })

    const report = JSON.parse(response.text)

    report.technicalQuestions =
        ensureQuestionLength(
            report.technicalQuestions,
            targetTechnicalQuestions,
            "Technical"
        )

    report.behavioralQuestions =
        ensureQuestionLength(
            report.behavioralQuestions,
            targetBehavioralQuestions,
            "Behavioral"
        )

    report.preparationPlan =
        ensureRoadmapLength(
            report.preparationPlan,
            targetRoadmapDays
        )

    return report
}

async function generatePdfFromHtml(htmlContent) {

    let browser = null

    try {

        browser = await puppeteer.launch({

            headless: true,

            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        })

        const page = await browser.newPage()

        await page.setContent(
            htmlContent,
            {
                waitUntil: "networkidle0"
            }
        )

        const pdfBuffer = await page.pdf({

            format: "A4",

            printBackground: true,

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })

        return pdfBuffer

    } catch (error) {

        console.error(
            "PDF Generation Error:",
            error
        )

        throw error

    } finally {

        if (browser) {

            await browser.close()
                .catch(console.error)
        }
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const resumePdfSchema = z.object({
        html: z.string()
    })

    const prompt = `
        Generate a professional ATS-friendly resume.

        Resume:
        ${resume}

        Self Description:
        ${selfDescription}

        Job Description:
        ${jobDescription}

        Return JSON with:
        {
          "html": "resume html"
        }
    `

    const response = await ai.models.generateContent({

        model: "gemini-2.5-flash",

        contents: prompt,

        config: {
            responseMimeType: "application/json",

            responseSchema:
                zodToJsonSchema(resumePdfSchema)
        }
    })

    const jsonContent =
        JSON.parse(response.text)

    const pdfBuffer =
        await generatePdfFromHtml(
            jsonContent.html
        )

    return pdfBuffer
}

module.exports = {
    generateInterviewReport,
    generateResumePdf
}