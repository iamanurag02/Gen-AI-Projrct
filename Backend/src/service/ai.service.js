const { GoogleGenAI } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GEMINI_API_KEY
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

     const prompt = `Generate a comprehensive interview report for a candidate with the following details:
                        Resume: ${resume || "Not provided"}
                        Self Description: ${selfDescription || "Not provided"}
                        Job Description: ${jobDescription || "Not provided"}

                        Instructions:
                        Return a JSON object with the following structure:
                        {
                            "matchScore": number (0-100),
                            "technicalQuestions": [
                                { "question": "string", "intention": "string", "answer": "string" }
                            ],
                            "behavioralQuestions": [
                                { "question": "string", "intention": "string", "answer": "string" }
                            ],
                            "skillGaps": [
                                { "skill": "string", "severity": "low" | "medium" | "high" }
                            ],
                            "preparationPlan": [
                                { "day": number, "focus": "string", "tasks": ["string"] }
                            ],
                            "title": "string"
                        }

                        IMPORTANT: All arrays must be populated with detailed data. technicalQuestions must have at least 5 questions. preparationPlan must be at least 7 days.
`

     const responseSchema = {
        type: "object",
        properties: {
            matchScore: { type: "number" },
            technicalQuestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        intention: { type: "string" },
                        answer: { type: "string" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            behavioralQuestions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        intention: { type: "string" },
                        answer: { type: "string" }
                    },
                    required: ["question", "intention", "answer"]
                }
            },
            skillGaps: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        skill: { type: "string" },
                        severity: { type: "string", enum: ["low", "medium", "high"] }
                    },
                    required: ["skill", "severity"]
                }
            },
            preparationPlan: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        day: { type: "number" },
                        focus: { type: "string" },
                        tasks: { type: "array", items: { type: "string" } }
                    },
                    required: ["day", "focus", "tasks"]
                }
            },
            title: { type: "string" }
        },
        required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"]
    };


     const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    })

    console.log("Raw AI Response Text:", response.text);

    return JSON.parse(response.text)
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume || "Not provided"}
                        Self Description: ${selfDescription || "Not provided"}
                        Job Description: ${jobDescription || "Not provided"}

                        The response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of the resume should not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        You can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy; it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const responseSchema = {
        type: "object",
        properties: {
            html: { type: "string" }
        },
        required: ["html"]
    }

    const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    })

    console.log("Raw AI Resume PDF Response Text:", response.text)

    const jsonContent = JSON.parse(response.text)
    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)
    return pdfBuffer
}

async function generatePdfFromHtml(html) {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
    })
    await browser.close()
    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }







