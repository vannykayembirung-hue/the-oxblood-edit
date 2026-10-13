import Link from "next/link";

export default function Header() {
  return <header style={{background:"#0B0A08",color:"#EDE4D0",padding:"22px 6%",display:"flex",justifyContent:"space-between",alignItems:"center",gap:20,flexWrap:"wrap"}}>
    <Link href="/" style={{fontFamily:"Cinzel,serif",letterSpacing:".12em",textDecoration:"none"}}>THE OXBLOOD EDIT</Link>
    <nav style={{display:"flex",gap:20,fontSize:16}}>
      <Link href="/journal">Journal</Link><Link href="/shop/the-oxblood-code">The Oxblood Code</Link><Link href="/about">About</Link>
    </nav>
  </header>;
}
