const { PDFParse } = require('pdf-parse')
const { generateInterviewReport, generateResumePdf } = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model')

const PDF_HEADER_REGEX = /%PDF-/

const normalizeBuffer = (incoming) => {
  if (Buffer.isBuffer(incoming)) return incoming

  if (incoming instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(incoming))
  }

  if (ArrayBuffer.isView(incoming)) {
    return Buffer.from(
      incoming.buffer,
      incoming.byteOffset,
      incoming.byteLength
    )
  }

  return Buffer.from(String(incoming || ''), 'utf8')
}

const hasPdfHeader = (buffer) => {
  return (
    buffer &&
    buffer.length >= 5 &&
    PDF_HEADER_REGEX.test(buffer.toString('utf8', 0, 8))
  )
}

const deriveReportTitle = (jobDescription) => {
  if (!jobDescription) return 'Untitled Position'

  const firstLine =
    jobDescription
      .trim()
      .split(/\r?\n/)
      .find(Boolean) || jobDescription

  const words = firstLine.trim().split(/\s+/).slice(0, 8)

  return `${words.join(' ')}${words.length >= 8 ? '...' : ''}`
}

const parseResumeText = async (buffer) => {
  const pdfBuffer = normalizeBuffer(buffer)

  if (!hasPdfHeader(pdfBuffer)) {
    const error = new Error(
      'Uploaded file is not a valid PDF. Please upload a true PDF resume.'
    )

    error.status = 400

    throw error
  }

  try {
    const parser = new PDFParse({
      data: pdfBuffer,
    })

    const data = await parser.getText()

    if (typeof data === 'string') {
      return data.trim()
    }

    if (data && typeof data.text === 'string') {
      return data.text.trim()
    }

    return String(data || '').trim()

  } catch (err) {

    console.error('PDF parse failed:', err)

    const error = new Error(
      'Unable to parse uploaded resume. The PDF may be encrypted, corrupted, or unsupported.'
    )

    error.status = 400

    throw error
  }
}

const sendError = (res, status, message) => {
  return res.status(status).json({ message })
}

async function generateInterViewReportController(req, res, next) {

  try {

    const { selfDescription, jobDescription } = req.body

    let resumeText = ''

    if (req.file) {

      try {

        resumeText = await parseResumeText(req.file.buffer)

      } catch (err) {

        if (selfDescription?.trim()) {

          console.warn(
            'Resume parse failed. Continuing with self description only.'
          )

          resumeText = ''

        } else {

          return sendError(
            res,
            err.status || 400,
            `${err.message} Please upload another PDF or provide self description.`
          )
        }
      }
    }

    const aiReport = await generateInterviewReport({
      resume: resumeText,
      selfDescription,
      jobDescription,
    })

    const title =
      aiReport.title?.trim() ||
      deriveReportTitle(jobDescription)

    const matchScore =
      typeof aiReport.matchScore === 'number'
        ? aiReport.matchScore
        : Number(aiReport.matchScore) || 0

    const interviewReport =
      await interviewReportModel.create({
        user: req.user.id,

        resume: resumeText,

        selfDescription,

        jobDescription,

        ...aiReport,

        title,

        matchScore,
      })

    res.status(201).json({
      message: 'Interview report generated successfully.',
      interviewReport,
    })

  } catch (error) {

    console.error(error)

    next(error)
  }
}

async function getInterviewReportByIdController(req, res, next) {

  try {

    const { interviewId } = req.params

    const interviewReport =
      await interviewReportModel.findOne({
        _id: interviewId,
        user: req.user.id,
      })

    if (!interviewReport) {
      return sendError(res, 404, 'Interview report not found.')
    }

    res.status(200).json({
      message: 'Interview report fetched successfully.',
      interviewReport,
    })

  } catch (error) {

    console.error(error)

    next(error)
  }
}

async function getAllInterviewReportsController(req, res, next) {

  try {

    const interviewReports =
      await interviewReportModel
        .find({
          user: req.user.id,
        })
        .sort({ createdAt: -1 })
        .select(
          '-resume -selfDescription -jobDescription -__v'
        )

    res.status(200).json({
      message: 'Interview reports fetched successfully.',
      interviewReports,
    })

  } catch (error) {

    console.error(error)

    next(error)
  }
}

async function generateResumePdfController(req, res, next) {

  try {

    const { interviewReportId } = req.params

    const interviewReport =
      await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
      return sendError(res, 404, 'Interview report not found.')
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      jobDescription: interviewReport.jobDescription,
    })

    if (!pdfBuffer) {
      return sendError(
        res,
        500,
        'Failed to generate PDF.'
      )
    }

    res.setHeader(
      'Content-Type',
      'application/pdf'
    )

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=resume_${interviewReportId}.pdf`
    )

    res.setHeader(
      'Content-Length',
      pdfBuffer.length
    )

    return res.end(pdfBuffer)

  } catch (error) {

    console.error('PDF GENERATION ERROR:')
    console.error(error)

    return sendError(
      res,
      500,
      'Resume PDF generation failed.'
    )
  }
}

module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
}