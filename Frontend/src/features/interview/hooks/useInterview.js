import { useCallback, useContext, useEffect } from 'react'
import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from '../services/interview.api'
import { InterviewContext } from '../interview.context'
import { useParams } from 'react-router'

const withLoading = async (setLoading, action) => {
  setLoading(true)
  try {
    return await action()
  } finally {
    setLoading(false)
  }
}

export const useInterview = () => {
  const context = useContext(InterviewContext)
  const { interviewId } = useParams()

  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }

  const { loading, setLoading, report, setReport, reports, setReports } = context

  const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    return withLoading(setLoading, async () => {
      const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })

      if (!response?.interviewReport) {
        throw new Error('Unexpected response from the server.')
      }

      setReport(response.interviewReport)
      return response.interviewReport
    })
  }

  const getReportById = useCallback(
    async (id) => {
      if (report?._id === id) {
        return report
      }

      return withLoading(setLoading, async () => {
        const response = await getInterviewReportById(id)

        if (!response?.interviewReport) {
          throw new Error('Unexpected response from the server.')
        }

        setReport(response.interviewReport)
        return response.interviewReport
      })
    },
    [report, setLoading, setReport]
  )

  const getReports = useCallback(async () => {
    return withLoading(setLoading, async () => {
      const response = await getAllInterviewReports()

      if (!response?.interviewReports) {
        throw new Error('Unexpected response from the server.')
      }

      setReports(response.interviewReports)
      return response.interviewReports
    })
  }, [setLoading, setReports])

  const getResumePdf = async (interviewReportId) => {

  if (!interviewReportId) {
    throw new Error('Resume download requires a report ID.')
  }

  return withLoading(setLoading, async () => {

    const response = await generateResumePdf({
      interviewReportId
    })

    const blob = new Blob(
      [response.data],
      {
        type: 'application/pdf'
      }
    )

    const url =
      window.URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.setAttribute(
      'download',
      `resume_${interviewReportId}.pdf`
    )

    document.body.appendChild(link)

    link.click()

    link.remove()

    window.URL.revokeObjectURL(url)

    return true
  })
}

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    } else {
      getReports()
    }
  }, [interviewId, getReportById, getReports])

  return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
