import AgentAPI from "apminsight"
AgentAPI.config()
import express from "express"
import cors from "cors"
import "dotenv/config"
import securityMiddleware from "./src/middleware/security.js"
import { toNodeHandler } from "better-auth/node"
import { auth } from "./src/lib/auth.js"

const app = express()
const PORT = process.env.PORT || 8000

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL env is required in .env file")
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
)

app.use(express.json())

// ✅ FIXED AUTH ROUTE (ONLY THIS)
app.use("/api/auth/*splat", toNodeHandler(auth))

app.use(securityMiddleware)

app.listen(PORT, () => console.log(`Listening to http://localhost:${PORT}`))
