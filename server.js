import express from "express"
import securityMiddleware from "./src/middleware/security"
const app = express()
const PORT = process.env.PORT || 4000

// middleware
// if (!process.env.FRONTEND_URL)
//   throw new Error("FRONTEND_URL env is required in .env file")

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   }),
// )

app.use(express.json())
app.use(securityMiddleware)

app.listen(PORT, () => console.log(`Listening to http://localhost:${PORT}`))
