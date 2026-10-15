import Link from "next/link";
import type { Metadata } from "next";
import NewsletterCapture from "@/components/NewsletterCapture";
import WaxSeal from "@/components/WaxSeal";
import { ARCHETYPES } from "@/lib/villainess-quiz";
import {
  NEWSLETTER_NAME,
  SUBSCRIBE_ERROR_COPY,
  isArchetypeKey,
  isSubscribeErrorCode,
  isSubscribeSource,
  type SubscribeErrorCode
} from "@/lib/newsletter";

export const dynamic = "force-dynamic";

type SearchParams = { state?: string; archetype?: string; source?: string };

/**
 * `/subscribed` — where the double opt-in confirm link lands (`confirmed` or
 * `invalid`), and where a plain form post to `/api/subscribe` lands: `pending`
 * when it was recorded, or one of the API's refusal codes when it was not.
 */
type PageState = "confirmed" | "pending" | "invalid" | SubscribeErrorCode;

function resolveState(raw: string | undefined): PageState {
  if (raw === "confirmed" || raw === "pending") return raw;
  if (isSubscribeErrorCode(raw)) return raw;
  return "invalid";
}

const REFUSAL_TITLES: Record<SubscribeErrorCode, string> = {
  consent_required: "Nothing was recorded — the consent box was not ticked.",
  invalid_email: "Nothing was recorded — that address looked incomplete.",
  rate_limited: "Too many attempts in a minute.",
  invalid_body: "That request arrived malformed.",
  server_error: "The desk could not record that just now."
};

export function generateMetadata({ searchParams }: { searchParams?: SearchParams }): Metadata {
  const state = resolveState(searchParams?.state);
  const title =
    state === "confirmed"
      ? "Subscription Confirmed"
      : state === "pending"
        ? "Check Your Inbox"
        : state === "invalid"
          ? "Confirmation Link Not Recognised"
          : "Not Subscribed Yet";
  return {
    // The root layout's template appends "· The Oxblood Edit".
    title,
    description: "The double opt-in for The Sunday Dispatch and the archetype dossier.",
    robots: { index: false, follow: false }
  };
}

export default function SubscribedPage({ searchParams }: { searchParams?: SearchParams }) {
  const state = resolveState(searchParams?.state);
  const archetypeParam = searchParams?.archetype ?? "";
  const archetypeKey = isArchetypeKey(archetypeParam) ? archetypeParam : null;
  const archetype = archetypeKey ? ARCHETYPES[archetypeKey] : null;
  const source = isSubscribeSource(searchParams?.source) ? searchParams.source : "subscribed";
  const refused = isSubscribeErrorCode(state) ? state : null;

  const eyebrow =
    state === "confirmed"
      ? "Countersigned"
      : state === "pending"
        ? "Sealed · awaiting your countersignature"
        : refused
          ? "Unsigned"
          : "Seal unreadable";

  return (
    <div className="px-[6%] py-16 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <WaxSeal size={52} />
          <p className="eyebrow">{eyebrow}</p>
        </div>

        {state === "confirmed" || state === "pending" ? (
          <>
            {state === "confirmed" ? (
              <>
                <h1 className="text-4xl sm:text-5xl mb-5">Confirmed. Noted in the ledger.</h1>
                <p className="text-xl text-parchment/78 mb-6">
                  The double opt-in is on record and {NEWSLETTER_NAME} will begin on the next
                  Sunday. Your consent wording, its version and the time of your opt-in are stored
                  against your address — that record is yours to inspect or delete at any time.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl mb-5">Noted in the ledger.</h1>
                <p className="text-xl text-parchment/78 mb-6">
                  Your opt-in is recorded with the exact wording you agreed to. {NEWSLETTER_NAME}{" "}
                  goes out on Sundays: one click in the confirmation email and the desk will keep
                  writing. Until that click, nothing is sent.
                </p>
              </>
            )}
            {archetype && (
              <div className="velvet-card velvet-card--rule p-7 mb-8">
                <p className="eyebrow mb-3">
                  Dossier {archetype.roman} · {archetype.name}
                </p>
                <h2 className="text-2xl mb-3">{archetype.dossier.title}</h2>
                <p className="text-lg text-parchment/75 mb-5">{archetype.dossier.dek}</p>
                <p className="text-base text-parchment/65 mb-6">
                  The nine pages travel in the dispatch. In the meantime the full formula behind the
                  reading is in the journal.
                </p>
                <Link href={`/journal/${archetype.articleSlug}`} className="btn-oxblood">
                  READ {archetype.articleLabel.toUpperCase()}
                </Link>
              </div>
            )}
          </>
        ) : refused ? (
          <>
            <h1 className="text-4xl sm:text-5xl mb-5">{REFUSAL_TITLES[refused]}</h1>
            <p className="text-xl text-parchment/78 mb-8">
              {SUBSCRIBE_ERROR_COPY[refused]} Your address has not been stored.
            </p>
            <NewsletterCapture
              source={source}
              archetype={archetypeKey}
              heading={archetype ? `The Sunday Dispatch · ${archetype.name} dossier` : "The Sunday Dispatch"}
              subheading="One letter a week from the desk. Opt-in, double-confirmed, withdrawn in a click."
              className="mb-8"
            />
          </>
        ) : (
          <>
            <h1 className="text-4xl sm:text-5xl mb-5">That confirmation link did not work.</h1>
            <p className="text-xl text-parchment/78 mb-8">
              Links expire, and inboxes mangle long ones. Nothing is wrong with your subscription:
              the address stays pending until a confirmation is opened, so simply take the reading
              again — or write to the desk and a new link is sent.
            </p>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/quiz" className="btn-oxblood">
            Take the reading
          </Link>
          <Link href="/journal" className="btn-ghost">
            Read the journal
          </Link>
        </div>

        <p className="text-sm text-parchment/50 mt-8">
          Questions about your data? See the{" "}
          <Link href="/privacy" className="text-gold underline underline-offset-4">
            privacy notice
          </Link>{" "}
          or withdraw at any time on the{" "}
          <Link href="/unsubscribe" className="text-gold underline underline-offset-4">
            unsubscribe page
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
