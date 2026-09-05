import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import noteRoutes from './routes/note.route.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 4001

let isConnected = false
let dbPromise = null
export const connectDB = async () => {
  if (isConnected) return
  if (dbPromise) return dbPromise
  dbPromise = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      isConnected = true
      console.log("connected to MongoDB")
    } catch (error) {
      dbPromise = null
      console.log("Error connecting to MongoDB:", error)
      throw error
    }
  })()
  return dbPromise
}

app.use(express.json())

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : "*"

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins === "*" || !origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  })
)

app.use("/api/v1/noteapp", noteRoutes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" })
})

if (process.env.VERCEL !== "1") {
  const distDir = path.join(__dirname, '..', 'dist')
  app.use(express.static(distDir))
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distDir, 'index.html'))
    }
  })
}

const startServer = async () => {
  await connectDB()
  if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
    })
  }
}

startServer()

export default app
