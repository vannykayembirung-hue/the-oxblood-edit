import Link from "next/link";
import type { Metadata } from "next";
import WaxSeal from "@/components/WaxSeal";
import { ARCHETYPES } from "@/lib/villainess-quiz";
import { NEWSLETTER_NAME, isArchetypeKey } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Subscription Confirmed — The Oxblood Edit",
  description: "Your double opt-in is recorded. The archetype dossier and the Sunday Dispatch follow.",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default function SubscribedPage({
  searchParams
}: {
  searchParams?: { state?: string; archetype?: string };
}) {
  const state = searchParams?.state === "confirmed" ? "confirmed" : "invalid";
  const archetypeParam = searchParams?.archetype ?? "";
  const archetype = isArchetypeKey(archetypeParam) ? ARCHETYPES[archetypeParam] : null;

  return (
    <div className="px-[6%] py-16 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <WaxSeal size={52} />
          <p className="eyebrow">{state === "confirmed" ? "Countersigned" : "Seal unreadable"}</p>
        </div>

        {state === "confirmed" ? (
          <>
            <h1 className="text-4xl sm:text-5xl mb-5">Confirmed. Noted in the ledger.</h1>
            <p className="text-xl text-parchment/78 mb-6">
              The double opt-in is on record and {NEWSLETTER_NAME} will begin on the next Sunday.
              Your consent wording, its version and the time of your opt-in are stored against your
              address — that record is yours to inspect or delete at any time.
            </p>
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
