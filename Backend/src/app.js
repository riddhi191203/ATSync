const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const multer = require('multer')

const app = express()
const corsOrigin = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
)

const authRouter = require('./routes/auth.routes')
const interviewRouter = require('./routes/interview.routes')

app.use('/api/auth', authRouter)
app.use('/api/interview', interviewRouter)

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message })
  }

  if (err.message && err.message.includes('Only PDF resumes are supported')) {
    return res.status(400).json({ message: err.message })
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  })
})

module.exports = app