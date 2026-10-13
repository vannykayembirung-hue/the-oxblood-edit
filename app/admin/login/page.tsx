import { auth } from "@/lib/auth";
import { hasDatabaseUrl } from "@/lib/db";
import { loginAction } from "@/app/admin/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLogin({
  searchParams
}: {
  searchParams?: { error?: string };
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const errorCode = searchParams?.error;
  const isDevFallback = !hasDatabaseUrl && process.env.NODE_ENV !== "production";

  return (
    <div className="px-[8%] py-16 max-w-xl mx-auto min-h-[65vh]">
      <p className="font-cinzel text-xs tracking-[0.22em] text-oxblood uppercase mb-2">
        Editorial Control Room
      </p>
      <h1 className="text-3xl md:text-4xl mb-3">Admin Sign In</h1>
      <p className="text-lg text-nearblack/80 mb-6">
        Sign in to manage articles, product editions, and affiliate curation for The Oxblood Edit.
      </p>

      {errorCode && (
        <div
          role="alert"
          className="mb-6 border-l-4 border-oxblood bg-oxblood/10 px-4 py-3 text-oxblood font-medium"
        >
          {errorCode === "missing"
            ? "Please enter both your email address and password."
            : "Invalid credentials or too many failed login attempts. Please verify your email and password."}
        </div>
      )}

      {isDevFallback && (
        <div className="mb-6 border border-gold bg-white/80 p-4 text-sm">
          <p className="font-cinzel text-xs tracking-wider uppercase text-oxblood mb-1">
            Local Preview Mode (DATABASE_URL not set)
          </p>
          <p className="text-nearblack/85">
            Sign in with default local preview credentials:{" "}
            <code className="bg-cream px-1.5 py-0.5 font-mono text-xs">admin@oxblood.local</code> /{" "}
            <code className="bg-cream px-1.5 py-0.5 font-mono text-xs">OxbloodAdmin!2026</code>
          </p>
        </div>
      )}

      <form action={loginAction} className="grid gap-5 bg-white p-8 border-t-4 border-oxblood shadow-sm">
        <label className="block">
          <span className="block font-cinzel text-xs tracking-widest uppercase mb-2">
            Email Address
          </span>
          <input
            name="email"
            type="email"
            required
            defaultValue={isDevFallback ? "admin@oxblood.local" : ""}
            placeholder="admin@your-domain.com"
            className="block w-full border border-nearblack/25 bg-cream/30 px-3.5 py-3 text-base focus:border-oxblood focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="block font-cinzel text-xs tracking-widest uppercase mb-2">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            defaultValue={isDevFallback ? "OxbloodAdmin!2026" : ""}
            placeholder="••••••••••••"
            className="block w-full border border-nearblack/25 bg-cream/30 px-3.5 py-3 text-base focus:border-oxblood focus:outline-none"
          />
        </label>

        <button
          className="btn-gold border-0 cursor-pointer text-center mt-2 w-full"
          type="submit"
        >
          SIGN IN TO DASHBOARD
        </button>
      </form>
    </div>
  );
}
