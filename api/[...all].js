import app, { connectDB } from '../backend/index.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (err) {
    console.error("Serverless DB error:", err?.message || err)
    if (!res.headersSent) {
      return res.status(500).json({
        message: "Database connection failed",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      })
    }
    return
  }

  try {
    await app(req, res)
  } catch (err) {
    console.error("Serverless handler error:", err?.message || err)
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" })
    }
  }
}
