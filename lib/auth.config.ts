import type { NextAuthConfig } from "next-auth";

const fallbackDevSecret =
  process.env.NODE_ENV !== "production"
    ? "oxblood-dev-only-secret-replace-in-production-env-32chars"
    : undefined;

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || fallbackDevSecret,
  pages: { signIn: "/admin/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnAdmin = nextUrl.pathname.startsWith("/admin");
      const isOnLogin = nextUrl.pathname.startsWith("/admin/login");

      if (isOnAdmin && !isOnLogin) {
        return isLoggedIn;
      }
      return true;
    }
  },
  providers: []
} satisfies NextAuthConfig;
