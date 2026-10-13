import Link from "next/link";

export default function Footer() {
  return <footer style={{background:"#0B0A08",color:"#EDE4D0",padding:"28px 6%",marginTop:70,fontSize:15,display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
    <span>THE OXBLOOD EDIT · True elegance does not shout.</span>
    <span><Link href="/disclosure">Affiliate disclosure</Link></span>
  </footer>;
}
