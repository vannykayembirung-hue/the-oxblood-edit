import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { sql } from "./db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!sql || !credentials?.email || !credentials?.password) return null;
        const rows = await sql`select id, email, password from users where email = ${String(credentials.email).toLowerCase()} limit 1`;
        const user = rows[0] as { id: string; email: string; password: string } | undefined;
        if (!user) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.password);
        return valid ? { id: user.id, email: user.email } : null;
      }
    })
  ],
  secret: process.env.AUTH_SECRET,
  pages: { signIn: "/admin/login" }
});
