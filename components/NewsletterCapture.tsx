"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_NAME,
  NEWSLETTER_PURPOSE,
  type DossierPayload
} from "@/lib/newsletter";
import type { ArchetypeKey } from "@/lib/villainess-quiz";

/**
 * NewsletterCapture — the house's only email capture surface.
 *
 * Compliance is built into the markup rather than into a line of small print:
 *   • the opt-in is an unticked checkbox, so consent is a positive act (UK GDPR
 *     Art. 7 + PECR, and the ASA/CAP requirement that marketing be identifiable);
 *   • the exact consent wording is displayed verbatim and sent to the API, which
 *     stores it against the subscriber row as evidence;
 *   • the purpose and the withdrawal route sit next to the button, not in the
 *     footer — CAP rule 2.3 asks for the ad to be obvious where the ad appears;
 *   • a honeypot field absorbs bots without a CAPTCHA penalty on real readers.
 */
export interface NewsletterCaptureProps {
  /** Where the opt-in happened — stored for accountability. */
  source: string;
  /** Requests a specific archetype dossier alongside the Sunday Dispatch. */
  archetype?: ArchetypeKey | null;
  variant?: "card" | "inline" | "footer";
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  /** Reveals the dossier immediately on success rather than promising an email. */
  revealDossier?: boolean;
  className?: string;
}

interface SubscribeSuccess {
  email: string;
  dossier: DossierPayload | null;
  confirmUrl?: string;
  alreadyConfirmed?: boolean;
}

const ERROR_COPY: Record<string, string> = {
  invalid_email: "That address does not look complete — check it and try again.",
  consent_required: "Tick the consent box and the desk will write to you.",
  rate_limited: "Too many attempts in a minute. Wait a moment, then try again.",
  invalid_body: "That request arrived malformed. Reload the page and try again.",
  server_error: "The desk could not record that just now. Please try again shortly."
};

export default function NewsletterCapture({
  source,
  archetype = null,
  variant = "card",
  heading = "The Sunday Dispatch",
  subheading = "One letter a week: the formula, the fit file and what the desk is actually wearing.",
  ctaLabel = "SEND ME THE DISPATCH",
  revealDossier = false,
  className = ""
}: NewsletterCaptureProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SubscribeSuccess | null>(null);

  const fieldId = useId();
  const emailId = `${fieldId}-email`;
  const consentId = `${fieldId}-consent`;
  const honeypotId = `${fieldId}-company`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    if (!consent) {
      setState("error");
      setError(ERROR_COPY.consent_required);
      return;
    }

    setState("sending");
    setError(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          consent,
          archetype,
          source,
          company: honeypot
        })
      });

      const data = (await response.json()) as {
        ok?: boolean;
        code?: string;
        message?: string;
        dossier?: DossierPayload | null;
        confirmUrl?: string;
        alreadyConfirmed?: boolean;
      };

      if (!response.ok || !data.ok) {
        setState("error");
        setError(
          ERROR_COPY[data.code ?? ""] ??
            data.message ??
            "Something went wrong. Please try again shortly."
        );
        return;
      }

      setSuccess({
        email,
        dossier: data.dossier ?? null,
        confirmUrl: data.confirmUrl,
        alreadyConfirmed: data.alreadyConfirmed
      });
      setState("done");
    } catch {
      setState("error");
      setError("The desk could not be reached. Check your connection and try again.");
    }
  }

  const wrapperClass =
    variant === "card"
      ? "velvet-card velvet-card--rule p-7 sm:p-9"
      : variant === "footer"
        ? "velvet-inset p-6"
        : "p-0";

  if (state === "done" && success) {
    const dossier = revealDossier ? success.dossier : null;
    return (
      <div className={`${wrapperClass} ${className}`} aria-live="polite">
        <p className="eyebrow mb-3">Sealed · countersigned</p>
        <h2 className="text-2xl sm:text-3xl mb-3">
          {success.alreadyConfirmed ? "You are already on the list." : "Noted in the ledger."}
        </h2>
        <p className="text-lg text-parchment/75 mb-4">
          {NEWSLETTER_NAME} goes out on Sundays. One click in the confirmation email and the desk
          will keep writing.
        </p>
        {success.confirmUrl && (
          <p className="text-sm text-parchment/60 mb-6 break-all">
            Preview mode — confirm the double opt-in here:{" "}
            <a href={success.confirmUrl} className="text-gold underline underline-offset-4">
              {success.confirmUrl}
            </a>
          </p>
        )}

        {dossier && (
          <div className="velvet-inset p-5 sm:p-6 mb-6">
            <p className="font-cinzel text-[0.62rem] tracking-[0.26em] uppercase text-gold/85 mb-2">
              Dossier {dossier.roman} · {dossier.archetypeName}
            </p>
            <h3 className="text-xl mb-2">{dossier.title}</h3>
            <p className="text-base text-parchment/75 mb-5">{dossier.dek}</p>
            <ul className="space-y-2.5 mb-5">
              {dossier.chapters.map((chapter) => (
                <li key={chapter.heading} className="text-base text-parchment/80">
                  <span className="text-gold">{chapter.heading}</span> — {chapter.note}
                </li>
              ))}
            </ul>
            <p className="text-sm text-parchment/55">
              Six of six. {dossier.care}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {dossier && (
            <Link href={`/journal/${dossier.articleSlug}`} className="btn-ghost">
              READ {dossier.articleLabel.toUpperCase()}
            </Link>
          )}
          <Link
            href="/privacy"
            className="font-cinzel text-[0.66rem] tracking-[0.22em] uppercase text-parchment/60 hover:text-gold no-underline"
          >
            How the desk uses your address
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} ${className}`}>
      <p className="eyebrow mb-3">{heading}</p>
      <p className="text-lg text-parchment/75 mb-6 max-w-2xl">{subheading}</p>

      <form onSubmit={submit} className="grid gap-4" noValidate>
        {/* Honeypot: hidden from readers, irresistible to bots. */}
        <label htmlFor={honeypotId} className="sr-only" aria-hidden="true">
          Company (leave blank)
        </label>
        <input
          id={honeypotId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
          className="hidden"
        />

        <div className="grid sm:grid-cols-[1.4fr_auto] gap-3 items-start">
          <label htmlFor={emailId} className="block">
            <span className="block font-cinzel text-[0.66rem] tracking-[0.24em] uppercase text-parchment/70 mb-2">
              Email address
            </span>
            <input
              id={emailId}
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gold/30 bg-nearblack/60 px-3.5 py-3 text-base text-parchment placeholder:text-parchment/35 focus:border-gold focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-oxblood border-0 cursor-pointer mt-0 sm:mt-7 disabled:opacity-60 disabled:cursor-wait"
          >
            {state === "sending" ? "SENDING…" : ctaLabel}
          </button>
        </div>

        <div className="flex items-start gap-3">
          <input
            id={consentId}
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onChange={(event) => {
              setConsent(event.target.checked);
              if (event.target.checked) setError(null);
            }}
            className="mt-1.5 h-4 w-4 shrink-0 accent-[#6E1423]"
          />
          <label htmlFor={consentId} className="text-sm text-parchment/70 leading-relaxed">
            {NEWSLETTER_CONSENT_TEXT}{" "}
            <Link href="/privacy" className="text-gold underline underline-offset-4">
              Privacy notice
            </Link>
            .
          </label>
        </div>

        {error && (
          <p role="alert" className="border-l-4 border-oxblood bg-oxblood/15 px-4 py-3 text-parchment">
            {error}
          </p>
        )}

        <p className="text-xs text-parchment/50 leading-relaxed">
          Purpose: {NEWSLETTER_PURPOSE} Double opt-in: nothing is sent until you confirm. Withdraw
          in one click from any email, or from the{" "}
          <Link href="/unsubscribe" className="text-parchment/70 underline underline-offset-4">
            unsubscribe page
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
