const _log = (m) => { process.stdout.write('[' + new Date().toISOString() + '] ' + m + '\n'); process.stdout.clearLine && process.stdout.moveCursor && process.stdout.cursorTo && process.stdout.write('') }
_log("BOOT: backend/index.js starting. Node=" + process.version + " VERCEL=" + process.env.VERCEL)

process.on('uncaughtException', (e) => _log('FATAL uncaughtException: ' + (e && e.stack || e)))
process.on('unhandledRejection', (e) => _log('FATAL unhandledRejection: ' + (e && e.stack || e)))

import dotenv from 'dotenv'
dotenv.config()
_log("BOOT: dotenv loaded. MONGODB_URL set=" + !!process.env.MONGODB_URL)

const stripQuotes = (s) => (s ? s.replace(/^["']|["']$/g, '') : s)
process.env.MONGODB_URL = stripQuotes(process.env.MONGODB_URL)
process.env.PORT = stripQuotes(process.env.PORT) || '4001'

let express, mongoose, cors, pathMod, urlMod, fs, noteRoutes
try {
  _log("BOOT: importing express...")
  express = (await import('express')).default
  _log("BOOT: importing mongoose...")
  mongoose = (await import('mongoose')).default
  _log("BOOT: importing cors...")
  cors = (await import('cors')).default
  _log("BOOT: importing node libs...")
  pathMod = (await import('path')).default
  urlMod = (await import('url'))
  fs = (await import('fs')).default
  _log("BOOT: importing routes...")
  noteRoutes = (await import('./routes/note.route.js')).default
  _log("BOOT: all imports OK")
} catch (e) {
  _log("FATAL IMPORT ERROR: " + (e && e.stack || e))
  throw e
}

const __filename = urlMod.fileURLToPath(import.meta.url)
const __dirname = pathMod.dirname(__filename)
const app = express()
const port = Number(process.env.PORT)

let isConnected = false
let dbPromise = null
export const connectDB = async () => {
  if (isConnected) return true
  if (dbPromise) return dbPromise
  dbPromise = (async () => {
    const timeoutMs = 8000
    try {
      if (!process.env.MONGODB_URL) {
        throw new Error("MONGODB_URL is not set in environment variables")
      }
      const timeoutPromise = new Promise((_, rej) =>
        setTimeout(() => rej(new Error("MongoDB connect timed out after " + timeoutMs + "ms")), timeoutMs)
      )
      await Promise.race([
        mongoose.connect(process.env.MONGODB_URL, {
          serverSelectionTimeoutMS: timeoutMs,
          bufferCommands: false,
          connectTimeoutMS: timeoutMs,
          socketTimeoutMS: timeoutMs,
        }),
        timeoutPromise
      ])
      isConnected = true
      _log("DB: connected to MongoDB successfully")
      return true
    } catch (error) {
      dbPromise = null
      _log("DB: connection FAILED: " + error.message)
      return false
    }
  })()
  return dbPromise
}

app.use(express.json())

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : "*"

app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true,
}))

app.use("/api/v1/noteapp", noteRoutes)

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", dbConnected: isConnected, ts: Date.now() })
})

if (process.env.VERCEL !== "1") {
  const distDir = pathMod.join(__dirname, '..', 'dist')
  if (fs.existsSync(distDir)) {
    _log("BOOT: serving static files from " + distDir)
    app.use(express.static(distDir))
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        return res.sendFile(pathMod.join(distDir, 'index.html'))
      }
      next()
    })
  } else {
    _log("BOOT: dist/ not found at " + distDir + ". Static files not served.")
  }
}

const startServer = async () => {
  _log("BOOT: startServer() - connecting DB in background...")
  connectDB().then(ok => _log("BOOT: initial connectDB done, ok=" + ok))
  if (process.env.VERCEL !== "1") {
    app.listen(port, () => {
      _log("BOOT: HTTP server listening on port " + port + " -> http://localhost:" + port)
    })
  } else {
    _log("BOOT: VERCEL=1 mode. Skipping listen. Awaiting invocations.")
  }
}

startServer().catch(e => _log("startServer() error: " + (e && e.stack || e)))

export default app
