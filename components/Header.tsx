import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-nearblack text-cream px-[6%] py-5 flex justify-between items-center gap-5 flex-wrap border-b border-gold/20">
      <Link
        href="/"
        className="font-cinzel tracking-[0.14em] text-lg no-underline hover:text-gold transition-colors"
      >
        THE OXBLOOD EDIT
      </Link>
      <nav className="flex items-center gap-6 text-lg">
        <Link href="/journal" className="no-underline hover:text-gold transition-colors">
          Journal
        </Link>
        <Link
          href="/shop/the-oxblood-code"
          className="no-underline hover:text-gold transition-colors"
        >
          The Oxblood Code
        </Link>
        <Link href="/about" className="no-underline hover:text-gold transition-colors">
          About
        </Link>
      </nav>
    </header>
  );
}
