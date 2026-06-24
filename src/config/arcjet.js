import arcjet, { shield, detectBot } from "@arcjet/node"
import "dotenv/config"

const isProd = process.env.ARCJET_ENV === "production"

const aj = arcjet({
  key: process.env.ARCJET_KEY,

  rules: [
    shield({}),

    ...(isProd
      ? [
          detectBot({
            mode: "LIVE",
            allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR"],
          }),
        ]
      : []), // 👈 disable bot detection completely in dev
  ],
})

export default aj
