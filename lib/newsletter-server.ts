import crypto from "crypto";

/**
 * Newsletter plumbing that may only run on the server.
 *
 * Split out of `lib/newsletter.ts` on purpose: the consent copy, the dossier
 * builder and the validators are imported by the client capture component, and
 * pulling `node:crypto` into that bundle would break the browser build.
 */

/**
 * ICO-friendly consent evidence without hoarding personal data: the IP is only
 * ever stored as a salted SHA-256 digest, and only to distinguish a reader's
 * device from a script hammering the endpoint.
 */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt =
    process.env.NEWSLETTER_CONSENT_SALT ||
    process.env.AUTH_SECRET ||
    "oxblood-consent-salt-dev-only";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/**
 * Absolute URL for a redirect or a link, built for life behind a proxy.
 *
 * `new URL(req.url).origin` reflects Next's own bind address in some
 * deployments (`http://0.0.0.0:3000`), which is useless in an email link, so the
 * configured site URL wins, then the forwarded host, then the Host header.
 */
export function absoluteUrl(req: Request, path: string): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  if (configured) return `${configured}${path}`;

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (host) {
    const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/.test(host);
    const proto = req.headers.get("x-forwarded-proto") || (isLocal ? "http" : "https");
    return `${proto}://${host}${path}`;
  }

  return new URL(path, req.url).toString();
}

export function clientIpFrom(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") || null;
}

export function createToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/**
 * Minimal in-process rate limit. Good enough to stop a single form being
 * hammered inside one serverless instance; put a distributed limiter in front
 * for anything louder. The API answers 429 either way.
 */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const attempts = new Map<string, { count: number; firstAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.firstAt > RATE_LIMIT_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}
