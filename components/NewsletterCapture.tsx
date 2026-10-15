"use client";

import Link from "next/link";
import { useCallback, useId, useRef, useState } from "react";
import {
  NEWSLETTER_CONSENT_TEXT,
  NEWSLETTER_NAME,
  NEWSLETTER_PURPOSE,
  SUBSCRIBE_ERROR_COPY,
  isSubscribeErrorCode,
  isValidEmail,
  normalizeEmail,
  type DossierPayload
} from "@/lib/newsletter";
import type { ArchetypeKey } from "@/lib/villainess-quiz";

/**
 * NewsletterCapture — the house's only email capture surface.
 *
 * Compliance is built into the markup rather than into a line of small print:
 *   • the opt-in is an unticked checkbox, so consent is a positive act (UK GDPR
 *     Art. 7 + PECR, and the ASA/CAP requirement that marketing be identifiable);
 *   • the exact consent wording is displayed verbatim and the API stores it
 *     against the subscriber row as evidence;
 *   • the purpose and the withdrawal route sit next to the button, not in the
 *     footer — CAP rule 2.3 asks for the ad to be obvious where the ad appears;
 *   • a honeypot field absorbs bots without a CAPTCHA penalty on real readers.
 *
 * The form believes the page, not React's memory of it:
 *   • the address and the consent box are uncontrolled and read from the DOM at
 *     the moment of submission. On a slow connection a reader can type and tick
 *     before the bundle hydrates, and browsers restore a ticked box on Back or
 *     reload. Controlled inputs kept React's stale `false`, answered a visibly
 *     ticked box with "Tick the consent box…" and then cleared the box and the
 *     address on the next render;
 *   • the consent box sits between the address and the button, so the reader
 *     (and the keyboard's tab order) meets it before the send button;
 *   • a refused submission moves focus to the field at fault, marks it
 *     `aria-invalid` and points it at the message;
 *   • before hydration, or without JavaScript, the form still works: it POSTs to
 *     `/api/subscribe` — never a GET that would put the address in the URL — with
 *     the browser's own required-field checks, and the API answers with
 *     `/subscribed?state=…`.
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

type InvalidField = "email" | "consent" | null;

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
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<InvalidField>(null);
  const [success, setSuccess] = useState<SubscribeSuccess | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  // Server-rendered without `noValidate`, so a submission that beats hydration
  // still gets the browser's own required-field checks. Once React owns the
  // form, refusals are reported in the house voice instead.
  const formRef = useCallback((form: HTMLFormElement | null) => {
    if (form) form.noValidate = true;
  }, []);

  const fieldId = useId();
  const emailId = `${fieldId}-email`;
  const consentId = `${fieldId}-consent`;
  const honeypotId = `${fieldId}-company`;
  const errorId = `${fieldId}-error`;

  function refuse(message: string, field: InvalidField) {
    setState("error");
    setError(message);
    setInvalidField(field);
    // Take the reader to the field at fault; focusing also scrolls it into view.
    if (field === "email") emailRef.current?.focus();
    if (field === "consent") consentRef.current?.focus();
  }

  function clearRefusal() {
    setState("idle");
    setError(null);
    setInvalidField(null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    // What is on the page right now — typed before hydration or restored by the
    // browser included — is what the reader has asked for.
    const email = normalizeEmail(emailRef.current?.value);
    const consent = consentRef.current?.checked === true;
    const company = honeypotRef.current?.value ?? "";

    if (!isValidEmail(email)) {
      refuse(SUBSCRIBE_ERROR_COPY.invalid_email, "email");
      return;
    }
    if (!consent) {
      refuse(SUBSCRIBE_ERROR_COPY.consent_required, "consent");
      return;
    }

    setState("sending");
    setError(null);
    setInvalidField(null);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ email, consent, archetype, source, company })
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        message?: string;
        dossier?: DossierPayload | null;
        confirmUrl?: string;
        alreadyConfirmed?: boolean;
      };

      if (!response.ok || !data.ok) {
        const code = data.code;
        refuse(
          (isSubscribeErrorCode(code) ? SUBSCRIBE_ERROR_COPY[code] : null) ??
            data.message ??
            "Something went wrong. Please try again shortly.",
          code === "invalid_email" ? "email" : code === "consent_required" ? "consent" : null
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
      refuse("The desk could not be reached. Check your connection and try again.", null);
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

  const emailInvalid = invalidField === "email";
  const consentInvalid = invalidField === "consent";

  return (
    <div className={`${wrapperClass} ${className}`}>
      <p className="eyebrow mb-3">{heading}</p>
      <p className="text-lg text-parchment/75 mb-6 max-w-2xl">{subheading}</p>

      <form
        ref={formRef}
        method="post"
        action="/api/subscribe"
        onSubmit={submit}
        className="grid gap-4"
      >
        {/* Carried by the plain-form fallback; the JSON request sends them from props. */}
        <input type="hidden" name="source" value={source} />
        {archetype && <input type="hidden" name="archetype" value={archetype} />}

        {/* Honeypot: hidden from readers, irresistible to bots. */}
        <label htmlFor={honeypotId} className="sr-only" aria-hidden="true">
          Company (leave blank)
        </label>
        <input
          ref={honeypotRef}
          id={honeypotId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
        />

        <label htmlFor={emailId} className="block max-w-xl">
          <span className="block font-cinzel text-[0.66rem] tracking-[0.24em] uppercase text-parchment/70 mb-2">
            Email address
          </span>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={emailInvalid || undefined}
            aria-describedby={emailInvalid ? errorId : undefined}
            onChange={() => {
              if (emailInvalid) clearRefusal();
            }}
            className={`w-full border bg-nearblack/60 px-3.5 py-3 text-base text-parchment placeholder:text-parchment/35 focus:border-gold focus:outline-none ${
              emailInvalid ? "border-[#B4485A]" : "border-gold/30"
            }`}
          />
        </label>

        {/* The opt-in comes before the button: the reader meets it on the way to "send". */}
        <div
          className={`flex items-start gap-3.5 border px-4 py-3.5 transition-colors ${
            consentInvalid ? "border-[#B4485A] bg-oxblood/20" : "border-gold/25 bg-nearblack/40"
          }`}
        >
          <input
            ref={consentRef}
            id={consentId}
            name="consent"
            type="checkbox"
            required
            aria-invalid={consentInvalid || undefined}
            aria-describedby={consentInvalid ? errorId : undefined}
            onChange={(event) => {
              if (event.currentTarget.checked && consentInvalid) clearRefusal();
            }}
            className="consent-box"
          />
          <label htmlFor={consentId} className="text-sm text-parchment/75 leading-relaxed cursor-pointer">
            {NEWSLETTER_CONSENT_TEXT}{" "}
            <Link href="/privacy" className="text-gold underline underline-offset-4">
              Privacy notice
            </Link>
            .
          </label>
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="border-l-4 border-oxblood bg-oxblood/15 px-4 py-3 text-parchment"
          >
            {error}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="btn-oxblood border-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {state === "sending" ? "SENDING…" : ctaLabel}
          </button>
        </div>

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
