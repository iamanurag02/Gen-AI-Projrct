import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, deleteInterviewReport , generateResumePdf } from "../services/interview.api"
import { useContext, useEffect, useCallback } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response?.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.error('Error generating report:', error)
        } finally {
            setLoading(false)
        }
        return null
    }, [setLoading, setReport])

    const getReportById = useCallback(async (id) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(id)
            if (response?.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setLoading(false)
        }
        return null
    }, [setLoading, setReport])

    const getReports = useCallback(async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            if (response?.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
        return null
    }, [setLoading, setReports])

    const deleteReport = useCallback(async (reportId) => {
        setLoading(true)
        try {
            const response = await deleteInterviewReport(reportId)
            if (response?.message) {
                setReports((currentReports) => currentReports.filter((report) => report._id !== reportId))
                return true
            }
        } catch (error) {
            console.error('Error deleting report:', error)
        } finally {
            setLoading(false)
        }
        return false
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId, getReportById, getReports ])

    return { loading, report, reports, generateReport, getReportById, getReports, deleteReport , getResumePdf }

}