import Link from "next/link";
import type { Metadata } from "next";
import WaxSeal from "@/components/WaxSeal";
import { CLARA_VANCE } from "@/lib/editorial-desk";
import { NEWSLETTER_NAME } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Withdraw Consent — The Oxblood Edit",
  description:
    "Withdraw consent to The Sunday Dispatch in one step, with or without the link from your last email.",
  alternates: { canonical: "/unsubscribe" },
  robots: { index: false, follow: true }
};

export const dynamic = "force-dynamic";

const STATES: Record<string, { title: string; body: string }> = {
  done: {
    title: "Consent withdrawn.",
    body: "The desk has recorded the withdrawal with the date and time, and no further dispatch will reach that address. There is nothing else to do — no confirmation email, no cooling-off question."
  },
  not_listed: {
    title: "That address is not on the list.",
    body: "Either it was never subscribed, or it has already been withdrawn, or the address was typed slightly differently. Either way, no dispatch is being sent to it."
  }
};

export default function UnsubscribePage({
  searchParams
}: {
  searchParams?: { state?: string; token?: string };
}) {
  const state = searchParams?.state ? STATES[searchParams.state] : null;
  const token = searchParams?.token ?? "";

  return (
    <div className="px-[6%] py-16 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <WaxSeal size={52} />
          <p className="eyebrow">Withdraw consent · UK GDPR Art. 7(3)</p>
        </div>

        {state ? (
          <>
            <h1 className="text-4xl sm:text-5xl mb-5">{state.title}</h1>
            <p className="text-xl text-parchment/78 mb-8">{state.body}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/journal" className="btn-ghost">
                Read the journal
              </Link>
              <Link href="/privacy" className="btn-ghost">
                Privacy notice
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl mb-5">Withdraw consent</h1>
            <p className="text-xl text-parchment/78 mb-8">
              One step, no reason required. Withdrawal stops {NEWSLETTER_NAME} immediately and is
              recorded with its date; the desk keeps nothing but the suppression record.
            </p>

            <form
              action="/api/subscribe/unsubscribe"
              method="POST"
              className="velvet-card velvet-card--rule p-7 sm:p-9 grid gap-5"
            >
              {token && <input type="hidden" name="token" value={token} />}

              {!token && (
                <label className="block">
                  <span className="block font-cinzel text-[0.66rem] tracking-[0.24em] uppercase text-parchment/70 mb-2">
                    The email address to remove
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full border border-gold/30 bg-nearblack/60 px-3.5 py-3 text-base text-parchment placeholder:text-parchment/35 focus:border-gold focus:outline-none"
                  />
                </label>
              )}

              <p className="text-sm text-parchment/60">
                {token
                  ? "Your unsubscribe token was found in the link, so a single click is enough."
                  : `If you still have the last dispatch, its unsubscribe link removes you in one click. Otherwise enter the address above and the desk will suppress it — replies are answered within one calendar month, as the privacy notice promises.`}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button type="submit" className="btn-oxblood border-0 cursor-pointer">
                  WITHDRAW CONSENT
                </button>
                <span className="text-sm text-parchment/50">
                  Or write to <span className="text-gold">{CLARA_VANCE.contactEmail}</span>
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
