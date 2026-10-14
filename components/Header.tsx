import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";

const NAV = [
  { href: "/journal", label: "Journal" },
  { href: "/quiz", label: "The Reading" },
  { href: "/shop/the-oxblood-code", label: "The Oxblood Code" },
  { href: "/about", label: "About" }
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-nearblack/90 backdrop-blur-sm border-b border-gold/25">
      <div className="px-[6%] py-4 flex justify-between items-center gap-5 flex-wrap">
        <Link
          href="/"
          className="flex items-center gap-3 no-underline group"
          aria-label="The Oxblood Edit — home"
        >
          <WaxSeal size={34} className="shrink-0" />
          <span className="font-cinzel tracking-[0.22em] text-base sm:text-lg text-parchment group-hover:text-gold transition-colors">
            THE OXBLOOD EDIT
          </span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-7 text-base">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="no-underline text-parchment/85 hover:text-gold transition-colors font-cinzel text-[0.7rem] tracking-[0.2em] uppercase"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
