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
      <p className="eyebrow mb-3">
        Editorial Control Room
      </p>
      <h1 className="text-3xl md:text-4xl mb-3">Admin Sign In</h1>
      <p className="text-lg text-parchment/75 mb-6">
        Sign in to manage articles, product editions, and affiliate curation for The Oxblood Edit.
      </p>

      {errorCode && (
        <div
          role="alert"
          className="mb-6 border-l-4 border-oxblood bg-oxblood/25 px-4 py-3 text-parchment font-medium"
        >
          {errorCode === "missing"
            ? "Please enter both your email address and password."
            : "Invalid credentials or too many failed login attempts. Please verify your email and password."}
        </div>
      )}

      {isDevFallback && (
        <div className="mb-6 velvet-inset p-4 text-sm">
          <p className="font-cinzel text-xs tracking-wider uppercase text-gold mb-1">
            Local Preview Mode (DATABASE_URL not set)
          </p>
          <p className="text-parchment/80">
            Sign in with default local preview credentials:{" "}
            <code className="bg-nearblack px-1.5 py-0.5 font-mono text-xs text-gold">admin@oxblood.local</code> /{" "}
            <code className="bg-nearblack px-1.5 py-0.5 font-mono text-xs text-gold">OxbloodAdmin!2026</code>
          </p>
        </div>
      )}

      <form action={loginAction} className="grid gap-5 velvet-card p-8">
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
            className="block w-full border border-gold/30 bg-nearblack/60 px-3.5 py-3 text-base text-parchment placeholder:text-parchment/35 focus:border-gold focus:outline-none"
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
            className="block w-full border border-gold/30 bg-nearblack/60 px-3.5 py-3 text-base text-parchment placeholder:text-parchment/35 focus:border-gold focus:outline-none"
          />
        </label>

        <button
          className="cta-bar cursor-pointer mt-2"
          type="submit"
        >
          SIGN IN TO DASHBOARD
        </button>
      </form>
    </div>
  );
}
