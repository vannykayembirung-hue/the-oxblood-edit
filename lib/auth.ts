import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";
import { authConfig } from "./auth.config";

const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;

interface RateLimitEntry {
  count: number;
  firstAttemptAt: number;
}

const failedLoginAttempts = new Map<string, RateLimitEntry>();

function isRateLimited(emailKey: string): boolean {
  const now = Date.now();
  const entry = failedLoginAttempts.get(emailKey);
  if (!entry) return false;
  if (now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    failedLoginAttempts.delete(emailKey);
    return false;
  }
  return entry.count >= MAX_FAILED_ATTEMPTS;
}

function recordFailedAttempt(emailKey: string): void {
  const now = Date.now();
  const entry = failedLoginAttempts.get(emailKey);
  if (!entry || now - entry.firstAttemptAt > LOGIN_WINDOW_MS) {
    failedLoginAttempts.set(emailKey, { count: 1, firstAttemptAt: now });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(emailKey: string): void {
  failedLoginAttempts.delete(emailKey);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        if (isRateLimited(email)) {
          console.warn(`Rate limit exceeded for login attempt: ${email}`);
          return null;
        }

        if (sql) {
          try {
            const rows = await sql`
              select id, email, password
              from users
              where lower(email) = ${email}
              limit 1
            `;
            const user = rows[0] as { id: string; email: string; password: string } | undefined;
            if (!user) {
              recordFailedAttempt(email);
              return null;
            }
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
              recordFailedAttempt(email);
              return null;
            }
            clearFailedAttempts(email);
            return { id: user.id, email: user.email };
          } catch (error) {
            console.error("Database authentication error:", error);
            return null;
          }
        }

        // Local development / preview fallback when DATABASE_URL is not configured
        if (process.env.NODE_ENV !== "production") {
          const devEmail = (process.env.ADMIN_EMAIL || "admin@oxblood.local").toLowerCase();
          const devPassword = process.env.ADMIN_PASSWORD || "OxbloodAdmin!2026";
          if (email === devEmail && password === devPassword) {
            clearFailedAttempts(email);
            return { id: "local-dev-admin", email: devEmail };
          }
        }

        recordFailedAttempt(email);
        return null;
      }
    })
  ]
});
