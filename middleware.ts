import { auth } from "@/lib/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/admin") && !path.startsWith("/admin/login") && !req.auth) {
    return Response.redirect(new URL("/admin/login", req.nextUrl.origin));
  }
});

export const config = { matcher: ["/admin/:path*"] };
