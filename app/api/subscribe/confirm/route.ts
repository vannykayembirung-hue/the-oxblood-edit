import { NextResponse } from "next/server";
import { confirmSubscriberByToken } from "@/lib/db";
import { absoluteUrl } from "@/lib/newsletter-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/subscribe/confirm?token=… — the double opt-in target.
 *
 * Confirming is an additive act (it only ever sets `confirmed`), so a link
 * scanner following the URL causes no harm and the reader still lands on a page
 * telling them where their dossier is.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const subscriber = token ? await confirmSubscriberByToken(token) : null;

  const path = subscriber
    ? `/subscribed?state=confirmed${
        subscriber.archetype ? `&archetype=${encodeURIComponent(subscriber.archetype)}` : ""
      }`
    : "/subscribed?state=invalid";

  return NextResponse.redirect(absoluteUrl(req, path), { status: 303 });
}
