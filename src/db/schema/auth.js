import { relations } from "drizzle-orm"
import {
  pgTable,
  text,
  boolean,
  pgEnum,
  index,
  timestamp,
} from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["user", "admin"])

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}

// ---------------- USER ----------------

export const user = pgTable("user", {
  id: text("id").primaryKey(), // FIXED (was serial)

  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),

  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),

  role: roleEnum("role").default("user").notNull(),

  imageCldPubId: text("image_cld_pub_id"),

  ...timestamps,
})

// ---------------- SESSION ----------------

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),

    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),

    ...timestamps,

    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),

    userId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
)

// ---------------- ACCOUNT ----------------

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),

    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),

    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),

    scope: text("scope"),
    password: text("password"),

    ...timestamps,
  },
  (table) => [index("account_user_id_idx").on(table.userId)],
)

// ---------------- VERIFICATION ----------------

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),

    identifier: text("identifier").notNull(),
    value: text("value").notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    ...timestamps,
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
)

// ---------------- RELATIONS ----------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))
