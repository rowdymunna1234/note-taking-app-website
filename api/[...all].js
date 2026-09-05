import app, { connectDB } from '../backend/index.js'

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (err) {
    return res.status(500).json({ message: "Database connection failed" })
  }
  return app(req, res)
}
