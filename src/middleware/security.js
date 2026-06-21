const securityMiddleware = async (req, res, next) => {
  import aj from "../config/arcjet"

  if (process.env.ARCJET_ENV === "test") return next()

  try {
    const role = req.user?.role ?? "guest"

    let limit
    let message

    switch (role) {
      case "admin":
        limit = 2
        message = "Admin requuest limit exceeded (20 per minute)"
        break
      case "user":
        limit = 10
        message = "user request limit exceeded (10 per minute). Please wait."
        break
      default:
        limit = 5
        message =
          "guest request limit exceeded (5 per minute). Please sign up for higher limit"
        break
    }

    const client = aj.withRule(
      slidingWindow({
        mode: "LIVE",
        interval: "1m",
        max: limit,
      }),
    )

    const arcjetRequest = {
      headers: req.headers,
      method: req.method,
      url: req.originalUrl ?? req.url,
      socket: {
        remoteAddress: req.socket.remoteAddress ?? req.ip ?? "0.0.0.0",
      },
    }

    const decision = await client.protect(arcjetRequest)

    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed",
      })
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy",
      })
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(403).json({
        error: "Too many requests",
        message,
      })
    }

    next()
  } catch (e) {
    console.error("arcjet middleware error: ", e)
    res.status(500).json({
      error: "Internal error",
      message: "Something went wrong with security middleware",
    })
  }
}

export default securityMiddleware
