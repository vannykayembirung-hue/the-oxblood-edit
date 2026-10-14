import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/db";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_CONSENT_VERSION,
  NEWSLETTER_NAME,
  NEWSLETTER_PURPOSE,
  NEWSLETTER_RETENTION,
  buildDossierPayload,
  isValidEmail,
  normalizeEmail,
  resolveArchetype
} from "@/lib/newsletter";
import { absoluteUrl, clientIpFrom, hashIp, isRateLimited } from "@/lib/newsletter-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/subscribe — the single opt-in endpoint behind every capture form.
 *
 * UK GDPR (Art. 6(1)(a) + Art. 7) and PECR require consent to be a positive act
 * and to be demonstrable, so this route:
 *   1. refuses any request that does not assert `consent: true` (`consent_required`);
 *   2. stores the exact wording, its version and the timestamp against the row;
 *   3. keeps only a salted hash of the IP, never the address itself;
 *   4. double-opt-ins: the row stays `pending` until the confirm link is opened;
 *   5. returns the requested archetype dossier immediately — the reader asked for
 *      it, and withholding a free document until a marketing email is confirmed
 *      would be a dark pattern, not compliance.
 */
export async function POST(req: Request) {
  const ip = clientIpFrom(req.headers);
  if (isRateLimited(`subscribe:${ip ?? "unknown"}`)) {
    return NextResponse.json(
      { ok: false, code: "rate_limited", message: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let payload: Record<string, unknown> = {};
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      payload = (await req.json()) as Record<string, unknown>;
    } else {
      const form = await req.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_body", message: "Send a JSON body or a form-encoded payload." },
      { status: 400 }
    );
  }

  // Honeypot: a field no human can see. Bots fill it, so we accept-and-discard.
  if (String(payload.company ?? "").trim()) {
    return NextResponse.json({ ok: true, status: "pending" });
  }

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, code: "invalid_email", message: "Please check that email address." },
      { status: 400 }
    );
  }

  const consent = payload.consent === true || payload.consent === "true" || payload.consent === "on";
  if (!consent) {
    return NextResponse.json(
      {
        ok: false,
        code: "consent_required",
        message:
          "The desk can only write to you if you tick the consent box — an unticked opt-in is the whole point of it."
      },
      { status: 400 }
    );
  }

  const archetype = resolveArchetype(payload.archetype);
  const source = String(payload.source ?? "unknown").slice(0, 60);

  try {
    const { subscriber, alreadyConfirmed } = await subscribeToNewsletter({
      email,
      archetype,
      source,
      consentText: NEWSLETTER_CONSENT_TEXT,
      consentVersion: NEWSLETTER_CONSENT_VERSION,
      ipHash: hashIp(ip)
    });

    const confirmUrl = absoluteUrl(
      req,
      `/api/subscribe/confirm?token=${encodeURIComponent(subscriber.confirm_token)}`
    );

    return NextResponse.json({
      ok: true,
      status: subscriber.status,
      alreadyConfirmed,
      email,
      archetype: subscriber.archetype,
      consentVersion: subscriber.consent_version,
      consentedAt: subscriber.consented_at,
      purpose: NEWSLETTER_PURPOSE,
      retention: NEWSLETTER_RETENTION,
      dispatchName: NEWSLETTER_NAME,
      dossier: archetype ? buildDossierPayload(archetype) : null,
      // Without a mail provider wired up yet, the confirm link is surfaced in
      // development only — in production it travels in the dispatch email.
      ...(process.env.NODE_ENV !== "production" || process.env.NEWSLETTER_DEBUG_LINKS === "true"
        ? { confirmUrl }
        : {})
    });
  } catch (error) {
    console.error("Subscribe failed:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "server_error",
        message: "The desk could not record that just now. Please try again shortly."
      },
      { status: 500 }
    );
  }
}
