import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  // Allows static pages to load during local setup; DB-backed pages still require DATABASE_URL.
}
export const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
