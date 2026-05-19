const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
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

const resumePdfSchema = z.object({
  html: z.string(),
});



const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const cleanJsonText = (text) => {
  if (!text) return "";

  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
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
      ""
    ).trim(),
  }));
};

const normalizeSkillGaps = (gaps = []) => {
  if (!Array.isArray(gaps)) return [];

  return gaps.map((gap) => ({
    skill: String(gap.skill || "").trim(),

    severity: ["low", "medium", "high"].includes(gap.severity)
      ? gap.severity
      : "medium",
  }));
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
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let rawText = "";

    if (typeof response.text === "function") {
      rawText = response.text();
    }
    else if (typeof response.text === "string") {
      rawText = response.text;
    }
    else if (response.outputText) {
      rawText = response.outputText;
    }

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

      matchScore:
        typeof parsedData.matchScore === "number"
          ? parsedData.matchScore
          : 50,

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
Generate a professional ATS-friendly HTML resume.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT:
- Return ONLY JSON
- No markdown
- No backticks

FORMAT:
{
  "html": "<html>...</html>"
}
`;

  try {

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    let rawText = "";

    if (typeof response.text === "function") {
      rawText = response.text();
    }
    else if (typeof response.text === "string") {
      rawText = response.text;
    }
    else if (response.outputText) {
      rawText = response.outputText;
    }

    const cleanedText = cleanJsonText(rawText);

    const parsedData = safeJsonParse(cleanedText);

    if (!parsedData?.html) {
      throw new Error("Invalid resume HTML");
    }

    const validated =
      resumePdfSchema.parse(parsedData);

    return generatePdfFromHtml(validated.html);

  } catch (error) {

    console.error("RESUME PDF ERROR:");
    console.error(error);

    throw error;
  }
};

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};