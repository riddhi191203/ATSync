const { GoogleGenAI, Type } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey:
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY,
});


const interviewQuestionSchema = z.object({
  question: z.string(),
  intention: z.string(),
  answer: z.string(),
});

const skillGapSchema = z.object({
  skill: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number(),

  technicalQuestions: z.array(interviewQuestionSchema),

  behavioralQuestions: z.array(interviewQuestionSchema),

  skillGaps: z.array(skillGapSchema),
});

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const interviewReportResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    matchScore: { type: Type.NUMBER },
    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          intention: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
        },
        required: ["skill", "severity"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
  ],
};



const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const cleanJsonText = (text) => {
  if (!text) return "";

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    return cleaned;
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
};

const extractResponseText = (response) => {
  if (!response) return "";

  if (typeof response.text === "function") {
    return response.text();
  }

  if (typeof response.text === "string") {
    return response.text;
  }

  if (typeof response.outputText === "string") {
    return response.outputText;
  }

  const parts =
    response.candidates?.flatMap((candidate) =>
      candidate.content?.parts || []
    ) || [];

  return parts
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n")
    .trim();
};

const clampScore = (score) => {
  const numeric = Number(score);

  if (!Number.isFinite(numeric)) return 50;

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const normalizeQuestions = (questions = []) => {
  if (!Array.isArray(questions)) return [];

  return questions.map((q) => ({
    question: String(q.question || q.q || "").trim(),

    intention: String(
      q.intention ||
      q.intent ||
      "Understand candidate knowledge."
    ).trim(),

    answer: String(
      q.answer ||
      q.response ||
      q.solution ||
      "Use the STAR method or a concise technical explanation tailored to the role."
    ).trim(),
  })).filter((q) => q.question);
};

const normalizeSkillGaps = (gaps = []) => {
  if (!Array.isArray(gaps)) return [];

  return gaps.map((gap) => ({
    skill: String(gap.skill || gap.name || "").trim(),

    severity: ["low", "medium", "high"].includes(gap.severity)
      ? gap.severity
      : "medium",
  })).filter((gap) => gap.skill);
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const paragraphsFromText = (text = "") =>
  String(text)
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("\n");

const buildFallbackResumeHtml = ({
  resume,
  selfDescription,
  jobDescription,
}) => `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        color: #172033;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        line-height: 1.45;
      }

      h1 {
        border-bottom: 2px solid #172033;
        font-size: 24px;
        margin: 0 0 14px;
        padding-bottom: 8px;
      }

      h2 {
        color: #23365f;
        font-size: 14px;
        margin: 18px 0 8px;
        text-transform: uppercase;
      }

      p {
        margin: 0 0 7px;
      }
    </style>
  </head>
  <body>
    <h1>ATS Optimized Resume</h1>
    <h2>Professional Summary</h2>
    ${paragraphsFromText(selfDescription) || "<p>Candidate summary not provided.</p>"}
    <h2>Resume Details</h2>
    ${paragraphsFromText(resume) || "<p>Resume text was not available from the uploaded file.</p>"}
    <h2>Target Role Alignment</h2>
    ${paragraphsFromText(jobDescription) || "<p>Job description not provided.</p>"}
  </body>
</html>
`;

const extractHtml = (text = "") => {
  const cleaned = String(text)
    .replace(/```html/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/<!doctype html[\s\S]*<\/html>|<html[\s\S]*<\/html>/i);

  return match ? match[0] : cleaned;
};

const fallbackInterviewReport = () => ({
  title: "Interview Report",

  matchScore: 50,

  technicalQuestions: [
    {
      question: "Explain your main technical projects.",
      intention: "Evaluate project understanding.",
      answer: "Discuss implementation, architecture, and challenges.",
    },

    {
      question: "Explain REST APIs.",
      intention: "Test backend fundamentals.",
      answer: "Explain HTTP methods and client-server communication.",
    },

    {
      question: "What is JWT authentication?",
      intention: "Check authentication knowledge.",
      answer: "Explain token-based authentication.",
    },

    {
      question: "Explain React state management.",
      intention: "Evaluate frontend concepts.",
      answer: "Discuss state updates and component rendering.",
    },

    {
      question: "What is database indexing?",
      intention: "Evaluate database optimization knowledge.",
      answer: "Explain how indexes improve query performance.",
    },
  ],

  behavioralQuestions: [
    {
      question: "Tell me about yourself.",
      intention: "Assess communication skills.",
      answer: "Provide concise professional summary.",
    },

    {
      question: "Describe a challenge you solved.",
      intention: "Assess problem-solving ability.",
      answer: "Explain challenge, action, and result.",
    },

    {
      question: "How do you handle deadlines?",
      intention: "Evaluate time management.",
      answer: "Explain planning and prioritization.",
    },

    {
      question: "Describe your teamwork experience.",
      intention: "Evaluate collaboration skills.",
      answer: "Discuss team communication and coordination.",
    },

    {
      question: "Why do you want this role?",
      intention: "Understand motivation.",
      answer: "Connect career goals with role responsibilities.",
    },
  ],

  skillGaps: [
    {
      skill: "System Design",
      severity: "high",
    },

    {
      skill: "Advanced Data Structures",
      severity: "medium",
    },

    {
      skill: "Cloud Deployment",
      severity: "medium",
    },
  ],
});

const generateInterviewReport = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {

  const prompt = `
Generate a professional interview report.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT RULES:
- Return ONLY valid JSON
- No markdown
- No backticks
- No explanations
- Generate minimum:
  - 5 technical questions
  - 5 behavioral questions
  - 3 skill gaps

REQUIRED JSON FORMAT:

{
  "title": "string",
  "matchScore": 75,

  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ]
}
`;

  try {

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: interviewReportResponseSchema,
        temperature: 0.35,
      },
    });

    const rawText = extractResponseText(response);

    console.log("RAW GEMINI RESPONSE:");
    console.log(rawText);

    const cleanedText = cleanJsonText(rawText);

    console.log("CLEANED RESPONSE:");
    console.log(cleanedText);

    const parsedData = safeJsonParse(cleanedText);

    if (!parsedData) {
      console.log("INVALID JSON RESPONSE");
      return fallbackInterviewReport();
    }

    const finalReport = {
      title: parsedData.title || "Interview Report",

      matchScore: clampScore(parsedData.matchScore),

      technicalQuestions: normalizeQuestions(
        parsedData.technicalQuestions
      ),

      behavioralQuestions: normalizeQuestions(
        parsedData.behavioralQuestions
      ),

      skillGaps: normalizeSkillGaps(
        parsedData.skillGaps
      ),
    };

    const validatedReport =
      interviewReportSchema.parse(finalReport);

    return validatedReport;

  } catch (error) {

    console.error("INTERVIEW REPORT ERROR:");
    console.error(error);

    return fallbackInterviewReport();
  }
};

const generatePdfFromHtml = async (html) => {

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    return await page.pdf({
      format: "A4",

      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "15mm",
        right: "15mm",
      },
    });

  } finally {
    await browser.close();
  }
};


const generateResumePdf = async ({
  resume,
  selfDescription,
  jobDescription,
}) => {

  const prompt = `
Generate a professional ATS-friendly resume as one complete HTML document.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT:
- Return ONLY raw HTML
- No markdown
- No backticks
- Include embedded CSS in a <style> tag
- Use simple ATS-friendly sections and readable typography
`;

  try {

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "text/plain",
        temperature: 0.35,
      },
    });

    const html = extractHtml(extractResponseText(response));

    if (!/<html[\s>]/i.test(html)) {
      throw new Error("Invalid resume HTML");
    }

    return generatePdfFromHtml(html);

  } catch (error) {

    console.error("RESUME PDF ERROR:");
    console.error(error);

    return generatePdfFromHtml(
      buildFallbackResumeHtml({
        resume,
        selfDescription,
        jobDescription,
      })
    );
  }
};

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};
