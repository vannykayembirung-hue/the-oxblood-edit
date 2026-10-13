import Link from "next/link";
import { sql } from "@/lib/db";

export default async function Home() {
  let articles: any[] = [];
  let product: any = null;
  if (sql) {
    try {
      articles = await sql`select slug, title, excerpt, category from articles where status='published' order by created_at desc limit 3`;
      product = (await sql`select name, slug, price, gumroad_url, description from products where slug='the-oxblood-code' limit 1`)[0] || null;
    } catch (error) {
      console.error("Database query failed. Check DATABASE_URL and run neon.sql.", error);
    }
  }
  return <div>
    <section style={{background:"#0B0A08",color:"#EDE4D0",padding:"90px 8% 100px"}}>
      <p style={{color:"#C6A15B",letterSpacing:".22em",fontSize:12}}>DARK ELEGANCE · US & UK</p>
      <h1 style={{fontSize:"clamp(38px,7vw,76px)",maxWidth:850,lineHeight:1.12}}>True elegance does not shout.</h1>
      <p style={{fontSize:22,maxWidth:620,color:"#d8cdb9"}}>A considered edit of vamp-romantic fashion, dark beauty and moody interiors.</p>
      <Link className="btn-gold" href="/shop/the-oxblood-code">DISCOVER THE OXBLOOD CODE</Link>
    </section>
    <section style={{padding:"56px 8%"}}>
      <h2 style={{fontSize:30}}>The signature guide</h2>
      <p style={{fontSize:20,maxWidth:680}}>Build a wardrobe around oxblood, black velvet, antique gold and timeless silhouettes.</p>
      <p><strong>{product?.name || "The Oxblood Code"}</strong> · ${product?.price ?? 27} USD</p>
      <Link className="btn-gold" href={product?.gumroad_url && product.gumroad_url !== "__GUMROAD_URL__" ? product.gumroad_url : "/shop/the-oxblood-code"}>EXPLORE THE GUIDE</Link>
    </section>
    <section style={{padding:"10px 8% 50px"}}>
      <h2 style={{fontSize:30}}>From the journal</h2>
      {articles.length ? <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:22}}>
        {articles.map((a:any)=><article key={a.slug} style={{borderTop:"1px solid #C6A15B",paddingTop:16}}><p style={{textTransform:"uppercase",fontSize:12,letterSpacing:".15em"}}>{a.category}</p><h3>{a.title}</h3><p>{a.excerpt}</p><Link href={`/journal/${a.slug}`}>Read article →</Link></article>)}
      </div> : <p>New editorial stories are being prepared. Visit the Journal soon.</p>}
    </section>
  </div>;
}
