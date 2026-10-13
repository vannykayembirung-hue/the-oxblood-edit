import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-nearblack text-cream px-[6%] py-8 mt-20 text-base flex justify-between items-center gap-4 flex-wrap border-t border-gold/20">
      <span>THE OXBLOOD EDIT · True elegance does not shout.</span>
      <div className="flex items-center gap-6 text-sm">
        <Link href="/disclosure" className="hover:text-gold transition-colors">
          Affiliate disclosure
        </Link>
        <Link href="/admin" className="text-cream/60 hover:text-gold transition-colors">
          Editorial Admin
        </Link>
      </div>
    </footer>
  );
}
