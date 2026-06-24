import { slidingWindow } from "@arcjet/node"
import aj from "../config/arcjet.js"
import "dotenv/config"

const securityMiddleware = async (req, res, next) => {
  if (process.env.ARCJET_ENV === "test") {
    return next()
  }

  try {
    const role = req.user?.role ?? "guest"

    let limit = 5
    let message =
      "Guest request limit exceeded (5 per minute). Please sign up for higher limits."

    switch (role) {
      case "admin":
        limit = 20
        message = "Admin request limit exceeded (20 per minute). Slow down."
        break

      case "teacher":
      case "student":
        limit = 10
        message = "User request limit exceeded (10 per minute). Please wait."
        break
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      }),
    )

    const decision = await client.protect(req)

    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed.",
      })
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy",
      })
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too many requests",
        message,
      })
    }

    next()
  } catch (error) {
    console.error("Arcjet middleware error:", error)

    return res.status(500).json({
      error: "Internal error",
      message: "Something went wrong with security middleware",
    })
  }
}

export default securityMiddleware
