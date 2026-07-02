const express = require("express")
const cokieParser = require("cookie-parser")
const cors = require("cors")

const app = express()
app.use(express.json())
app.use(cokieParser())
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true
}))



const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth" , authRouter)
app.use("/api/interview" , interviewRouter)

module.exports = app