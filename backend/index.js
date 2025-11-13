import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import noteRoutes from './routes/note.route.js'

const app = express()
dotenv.config()
const port = process.env.PORT || 4001

//Database Connection Code
try{
    mongoose.connect(process.env.MONGODB_URL)
    console.log("connected to MongoDB")
}
catch(error){
    console.log("Error connecting to MongoDB:", error)
}

//Routing Middleware
app.use(express.json())
app.use(cors())
app.use("/api/v1/noteapp", noteRoutes)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
