import Link from "next/link";
import WaxSeal from "@/components/WaxSeal";

const FOOTER_NAV = [
  { href: "/journal", label: "Journal" },
  { href: "/quiz", label: "Which Villainess Are You?" },
  { href: "/shop/the-oxblood-code", label: "The Oxblood Code" },
  { href: "/about", label: "House Manifesto" },
  { href: "/disclosure", label: "Affiliate disclosure" },
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

        <nav className="grid grid-cols-2 gap-y-3 gap-x-6 text-base">
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

      <div className="px-[6%] py-5 border-t border-gold/20 flex flex-wrap items-center justify-between gap-3 text-sm text-parchment/55">
        <span className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase">
          © {new Date().getFullYear()} The Oxblood Edit · Her uniform. Her lip. Her book.
        </span>
        <span className="font-cinzel text-[0.66rem] tracking-[0.24em] uppercase">
          Dark Elegance · US &amp; UK
        </span>
      </div>
    </footer>
  );
}
