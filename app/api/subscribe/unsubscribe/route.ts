import { NextResponse } from "next/server";
import { unsubscribeSubscriber } from "@/lib/db";
import { isValidEmail, normalizeEmail } from "@/lib/newsletter";
import { absoluteUrl, clientIpFrom, isRateLimited } from "@/lib/newsletter-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/subscribe/unsubscribe — withdrawal of consent (UK GDPR Art. 7(3)).
 *
 * Deliberately a POST: an unsubscribe that fires on GET can be triggered by a
 * mail scanner prefetching links, which would silently remove a reader who never
 * asked. The `/unsubscribe` page therefore renders a button that posts here.
 */
export async function POST(req: Request) {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(`unsubscribe:${ip ?? "unknown"}`)) {
    return NextResponse.json({ ok: false, code: "rate_limited" }, { status: 429 });
  }

  let token = "";
  let email = "";

  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as Record<string, unknown>;
      token = String(body.token ?? "").trim();
      email = normalizeEmail(body.email);
    } else {
      const form = await req.formData();
      token = String(form.get("token") ?? "").trim();
      email = normalizeEmail(form.get("email"));
    }
  } catch {
    return NextResponse.json({ ok: false, code: "invalid_body" }, { status: 400 });
  }

  if (email && !isValidEmail(email)) {
    return NextResponse.json({ ok: false, code: "invalid_email" }, { status: 400 });
  }
  if (!token && !email) {
    return NextResponse.json({ ok: false, code: "missing_identifier" }, { status: 400 });
  }

  const subscriber = await unsubscribeSubscriber({ token: token || null, email: email || null });

  // Same response either way: never confirm to a third party whether an address
  // was on the list.
  if (!subscriber) {
    if (contentType.includes("application/json")) {
      return NextResponse.json({ ok: true, state: "not_listed" });
    }
    return NextResponse.redirect(absoluteUrl(req, "/unsubscribe?state=not_listed"), { status: 303 });
  }

  if (contentType.includes("application/json")) {
    return NextResponse.json({
      ok: true,
      state: "unsubscribed",
      unsubscribedAt: subscriber.unsubscribed_at
    });
  }

  return NextResponse.redirect(absoluteUrl(req, "/unsubscribe?state=done"), { status: 303 });
}
