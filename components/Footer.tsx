import Link from "next/link";
import NewsletterCapture from "@/components/NewsletterCapture";
import WaxSeal from "@/components/WaxSeal";
import { CLARA_VANCE } from "@/lib/editorial-desk";

const FOOTER_NAV = [
  { href: "/journal", label: "Journal" },
  { href: "/quiz", label: "Which Villainess Are You?" },
  { href: "/shop/the-oxblood-code", label: "The Oxblood Code" },
  { href: "/about", label: "House Manifesto" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/disclosure", label: "Affiliate disclosure" },
  { href: "/privacy", label: "Privacy notice" },
  { href: "/unsubscribe", label: "Withdraw consent" },
  { href: "/admin", label: "Editorial Admin" }
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-velvet border-t border-gold/25">
      <div className="px-[6%] py-12 grid gap-10 md:grid-cols-[1.1fr_1fr] items-start">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <WaxSeal size={56} />
            <p className="font-cinzel tracking-[0.24em] text-lg">THE OXBLOOD EDIT</p>
          </div>
          <p className="text-lg text-parchment/70 max-w-md">
            True elegance does not shout. An independent dark-romantic editorial for US &amp; UK
            wardrobes — oxblood <span className="text-gold">#6E1423</span>, black velvet, antique
            gold <span className="text-gold">#C6A15B</span>, candlelight.
          </p>
        </div>

        <div className="grid gap-8">
          <NewsletterCapture
            source="footer"
            variant="footer"
            heading="The Sunday Dispatch"
            subheading="One letter a week from the desk. Opt-in, double-confirmed, withdrawn in a click."
            ctaLabel="SUBSCRIBE"
          />
        </div>
      </div>

      <div className="px-[6%] pb-10">
        <nav className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-base">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="no-underline text-parchment/75 hover:text-gold transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-[6%] py-5 border-t border-gold/20 grid gap-3 text-sm text-parchment/55">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase">
            © {new Date().getFullYear()} The Oxblood Edit · {CLARA_VANCE.signature}
          </span>
          <span className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase">
            Dark Elegance · US &amp; UK
          </span>
        </div>
        <p className="text-xs leading-relaxed max-w-3xl text-parchment/45">
          Every story carries a named byline and a review date. Affiliate links are labelled where
          they appear and marked sponsored — the desk may earn a commission at no extra cost to you
          (ASA/CAP rule 2.1 · FTC 16 CFR Part 255). Email is sent on opt-in consent only, with the
          wording and version stored against your record (UK GDPR · PECR); withdraw in one click on
          the{" "}
          <Link href="/unsubscribe" className="text-parchment/70 underline underline-offset-4">
            unsubscribe page
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
