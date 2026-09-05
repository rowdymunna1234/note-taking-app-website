console.log("[BACKEND] Starting up... Node:", process.version)
import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import noteRoutes from './routes/note.route.js'

dotenv.config()
console.log("[BACKEND] dotenv loaded. MONGODB_URL set:", !!process.env.MONGODB_URL, "VERCEL:", process.env.VERCEL)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const stripQuotes = (str) => {
  if (!str) return str
  return str.replace(/^["']|["']$/g, '')
}

process.env.MONGODB_URL = stripQuotes(process.env.MONGODB_URL)
process.env.PORT = process.env.PORT || 4001

const app = express()
const port = Number(process.env.PORT)

let isConnected = false
let dbPromise = null
export const connectDB = async () => {
  if (isConnected) return
  if (dbPromise) return dbPromise
  dbPromise = (async () => {
    try {
      if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL environment variable is not set")
      }
      await mongoose.connect(process.env.MONGODB_URL, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      })
      isConnected = true
      console.log("connected to MongoDB")
    } catch (error) {
      dbPromise = null
      console.log("Error connecting to MongoDB:", error.message)
      throw error
    }
  })()
  return dbPromise
}

app.use(express.json())

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
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
  res.json({ status: "ok", message: "Server is running", dbConnected: isConnected })
})

if (process.env.VERCEL !== "1") {
  const distDir = path.join(__dirname, '..', 'dist')
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir))
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distDir, 'index.html'))
      }
    })
  }
}

const startServer = async () => {
  console.log("[BACKEND] startServer() called")
  try {
    await connectDB()
    console.log("[BACKEND] DB connection promise resolved")
  } catch (e) {
    console.log("[BACKEND] DB connection failed, but starting server anyway:", e.message)
  }
  if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
      console.log(`[BACKEND] Server is running on port ${port}`)
    })
  } else {
    console.log("[BACKEND] VERCEL mode - skipping app.listen()")
  }
}

startServer().catch(e => console.error("[BACKEND] startServer() unhandled error:", e))

export default app
