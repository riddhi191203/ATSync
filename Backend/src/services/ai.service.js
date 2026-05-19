const { GoogleGenAI } = require('@google/genai')
const { z } = require('zod')
const { zodToJsonSchema } = require('zod-to-json-schema')
const puppeteer = require('puppeteer')

const DEBUG_AI = String(process.env.DEBUG_AI_RESPONSES || '').toLowerCase() === 'true'
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })

const interviewQuestionSchema = z.object({
  question: z.string().describe('The question text.'),
  intention: z.string().describe('The intention behind the question.'),
  answer: z.string().describe('The recommended answer.'),
})

const interviewReportSchema = z.object({
  title: z.string().min(1).default('Untitled Position').describe('The title of the job for which the interview report is generated.'),
  matchScore: z.preprocess((value) => {
    if (typeof value === 'string') {
      const parsed = Number(value.trim())
      return Number.isFinite(parsed) ? parsed : 0
    }
    return value
  }, z.number().min(0).max(100).default(0)).describe('A score between 0 and 100 indicating how well the profile matches the job description.'),
  technicalQuestions: z.array(interviewQuestionSchema).default([]).describe('Technical questions with intention and answer.'),
  behavioralQuestions: z.array(interviewQuestionSchema).default([]).describe('Behavioral questions with intention and answer.'),
  skillGaps: z.array(z.object({
    skill: z.string().describe('The missing skill'),
    severity: z.enum(['low', 'medium', 'high']).describe('The severity of the skill gap'),
  })).default([]).describe('List of skill gaps.'),
})

const resumePdfSchema = z.object({ html: z.string().min(1).describe('Resume HTML content for PDF generation') })

const normalizeArray = (items, normalizeFn) => {
  if (Array.isArray(items)) {
    return items.flatMap((item) => {
      const normalized = normalizeFn(item)
      return normalized ? [normalized] : []
    })
  }

  if (items && typeof items === 'object') {
    const normalized = normalizeFn(items)
    return normalized ? [normalized] : []
  }

  if (typeof items === 'string' && items.trim()) {
    try {
      const parsed = JSON.parse(items)
      return normalizeArray(parsed, normalizeFn)
    } catch {
      return []
    }
  }

  return []
}

const parseQuestionString = (text) => {
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed) return null

  const questionMatch = trimmed.match(/(?:question|q|prompt)\s*[:\-]\s*(.+?)(?:\n|$)/i)
  const answerMatch = trimmed.match(/(?:answer|response|recommendation|solution|advice|explanation)\s*[:\-]\s*(.+?)(?:\n|$)/i)
  const intentionMatch = trimmed.match(/(?:intention|intent|purpose|reason|goal)\s*[:\-]\s*(.+?)(?:\n|$)/i)

  const question = questionMatch?.[1]?.trim() || trimmed.split(/\n/)[0]?.trim()
  const answer = answerMatch?.[1]?.trim() || trimmed.split(/\n/).slice(1).join(' ').trim()
  const intention = intentionMatch?.[1]?.trim() || 'Clarify the purpose of this question.'

  if (!question || !answer) return null
  return { question, intention, answer }
}

const normalizeQuestion = (item) => {
  if (!item) return null
  if (typeof item === 'string') {
    return parseQuestionString(item)
  }
  if (typeof item !== 'object') return null

  const question = String(item.question ?? item.q ?? item.prompt ?? item.text ?? item.title ?? item.questionText ?? item.question_text ?? '').trim()
  const answer = String(item.answer ?? item.response ?? item.recommendation ?? item.solution ?? item.advice ?? item.explanation ?? item.answerText ?? item.answer_text ?? '').trim()
  const intention = String(item.intention ?? item.intent ?? item.purpose ?? item.reason ?? item.goal ?? '').trim()

  if (!question || !answer) {
    const rawText = Object.values(item)
      .filter((value) => typeof value === 'string')
      .join(' \n ')
    return parseQuestionString(rawText)
  }

  return {
    question,
    intention: intention || 'Clarify the purpose of this question.',
    answer,
  }
}

const normalizeSkillGap = (item) => {
  if (!item) return null
  if (typeof item === 'string') {
    const parts = item.split(/[:,\-–]/).map((part) => part.trim()).filter(Boolean)
    const skill = parts[0] || ''
    const severity = parts.find((part) => ['low', 'medium', 'high'].includes(part.toLowerCase())) || ''
    return skill && severity ? { skill, severity: severity.toLowerCase() } : null
  }

  if (typeof item !== 'object') return null
  const skill = String(item.skill ?? item.name ?? item.topic ?? item.area ?? item.subject ?? '').trim()
  const severity = String(item.severity ?? item.level ?? item.priority ?? item.severityLevel ?? item.importance ?? '').trim().toLowerCase()
  return skill && ['low', 'medium', 'high'].includes(severity) ? { skill, severity } : null
}

const getField = (data, key, aliases = []) => {
  if (!data || typeof data !== 'object') return undefined
  if (data[key] !== undefined) return data[key]
  for (const alias of aliases) {
    if (data[alias] !== undefined) return data[alias]
  }
  return undefined
}

const safeJsonParse = (value) => {
  if (typeof value !== 'string') return undefined
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

const extractJsonFromText = (text) => {
  if (typeof text !== 'string') return undefined
  const trimmed = text.trim()
  if (!trimmed) return undefined

  const direct = safeJsonParse(trimmed)
  if (direct !== undefined) return direct

  const objectStart = trimmed.indexOf('{')
  const objectEnd = trimmed.lastIndexOf('}')
  if (objectStart !== -1 && objectEnd > objectStart) {
    const candidate = trimmed.slice(objectStart, objectEnd + 1)
    const parsed = safeJsonParse(candidate)
    if (parsed !== undefined) return parsed
  }

  const arrayStart = trimmed.indexOf('[')
  const arrayEnd = trimmed.lastIndexOf(']')
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    const candidate = trimmed.slice(arrayStart, arrayEnd + 1)
    const parsed = safeJsonParse(candidate)
    if (parsed !== undefined) return parsed
  }

  return undefined
}

const extractJson = (response) => {
  if (!response) throw new Error('AI response is empty.')

  if (typeof response === 'string' && response.trim()) {
    const parsed = safeJsonParse(response.trim())
    if (parsed !== undefined) return parsed
  }

  if (typeof response.text === 'string' && response.text.trim()) {
    const parsed = extractJsonFromText(response.text)
    if (parsed !== undefined) return parsed
  }

  if (typeof response.outputText === 'string' && response.outputText.trim()) {
    const parsed = extractJsonFromText(response.outputText)
    if (parsed !== undefined) return parsed
  }

  const parseRaw = (raw) => {
    if (typeof raw === 'string' && raw.trim()) {
      const parsed = extractJsonFromText(raw)
      return parsed !== undefined ? parsed : raw
    }

    if (Array.isArray(raw)) {
      const rawText = raw
        .map((item) => {
          if (typeof item === 'string') return item
          if (Array.isArray(item?.content)) {
            return item.content.map((chunk) => (typeof chunk === 'string' ? chunk : chunk?.text)).filter(Boolean).join('')
          }
          if (item?.content && typeof item.content === 'string') return item.content
          if (item?.text && typeof item.text === 'string') return item.text
          return ''
        })
        .join('')
      const parsed = extractJsonFromText(rawText)
      return parsed !== undefined ? parsed : raw
    }

    if (raw && typeof raw === 'object') {
      if (raw.content) return parseRaw(raw.content)
      if (raw.output) return parseRaw(raw.output)
      if (raw.text && typeof raw.text === 'string') {
        const parsed = extractJsonFromText(raw.text)
        return parsed !== undefined ? parsed : raw
      }
      return raw
    }

    return raw
  }

  if (response.output !== undefined) {
    return parseRaw(response.output)
  }

  if (response?.response !== undefined) {
    return parseRaw(response.response)
  }

  throw new Error('AI response could not be parsed.')
}

const debugResponse = (label, response) => {
  if (!DEBUG_AI) return
  console.debug(`[AI DEBUG] ${label}:`, JSON.stringify(response, null, 2))
}

const ensureInterviewReport = (data) => {
  const raw = data?.interviewReport ?? data?.report ?? data
  const parsed = interviewReportSchema.safeParse(raw)
  if (parsed.success) return parsed.data

  const technicalQuestions = normalizeArray(
    getField(raw, 'technicalQuestions', ['technical_questions', 'technical', 'techQuestions', 'tech_questions', 'interviewQuestions', 'interview_questions']),
    normalizeQuestion,
  )
  const behavioralQuestions = normalizeArray(
    getField(raw, 'behavioralQuestions', ['behavioral_questions', 'behavioural_questions', 'behavioral', 'behavior_questions', 'behavior_questions']),
    normalizeQuestion,
  )
  const genericQuestions = normalizeArray(
    getField(raw, 'questions', ['questions', 'qa', 'interviewQuestions', 'interview_questions']),
    normalizeQuestion,
  )

  return interviewReportSchema.parse({
    title: String(getField(raw, 'title', ['jobTitle', 'reportTitle', 'job_title', 'report_title']) ?? 'Untitled Position').trim() || 'Untitled Position',
    matchScore: typeof getField(raw, 'matchScore', ['score', 'match_score']) === 'number'
      ? getField(raw, 'matchScore', ['score', 'match_score'])
      : Number(getField(raw, 'matchScore', ['score', 'match_score'])) || 0,
    technicalQuestions: technicalQuestions.length > 0 ? technicalQuestions : genericQuestions,
    behavioralQuestions,
    skillGaps: normalizeArray(getField(raw, 'skillGaps', ['skill_gaps', 'gaps', 'skills', 'missingSkills', 'skillGap', 'skill_gap', 'missing_skills']), normalizeSkillGap),
  })
}

const generateInterviewReport = async ({ resume, selfDescription, jobDescription }) => {
  const prompt = `Generate an interview report for a candidate with the following details:\nResume: ${resume}\nSelf Description: ${selfDescription}\nJob Description: ${jobDescription}\n\nReturn only JSON matching this schema:\n{\n  "title": "string",\n  "matchScore": 0,\n  "technicalQuestions": [{ "question": "string", "intention": "string", "answer": "string" }],\n  "behavioralQuestions": [{ "question": "string", "intention": "string", "answer": "string" }],\n  "skillGaps": [{ "skill": "string", "severity": "low|medium|high" }]\n}\nIf the model uses alternate property names, respond with the same data under one of these aliases: technical_questions, behavioral_questions, questions, skill_gaps, missingSkills. Do not include markdown, code fences, backticks, or explanation.`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema(interviewReportSchema),
    },
  })

  debugResponse('Interview report response', response)

  const reportData = extractJson(response)
  return ensureInterviewReport(reportData)
}

const generatePdfFromHtml = async (html) => {
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    return await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } })
  } finally {
    await browser.close()
  }
}

const generateResumePdf = async ({ resume, selfDescription, jobDescription }) => {
  const prompt = `Generate a resume for a candidate with the following details:\nResume: ${resume}\nSelf Description: ${selfDescription}\nJob Description: ${jobDescription}\n\nReturn only JSON with one field:\n{\"html\": \"string\"}\nThe HTML should be clean, professional, ATS-friendly, and suitable for a 1-2 page PDF.`

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  })

  debugResponse('Resume PDF response', response)

  const resumeData = extractJson(response)
  const { html } = resumePdfSchema.parse(resumeData)
  return generatePdfFromHtml(html)
}

module.exports = { generateInterviewReport, generateResumePdf }