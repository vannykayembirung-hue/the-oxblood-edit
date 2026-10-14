import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { auditArticle } from "../lib/admin-seo";
import { canonicalArchetype, contactSegment, isCrmSegment } from "../lib/admin-crm";
import { csvCell, crmCsvCells } from "../lib/admin-csv";
import { PRODUCT_SEEDS } from "../lib/products";

// No real database or subscriber store is touched by these tests.
delete process.env.DATABASE_URL;

test("CRM segment aliases match the quiz's canonical archetypes", () => {
  for (const segment of ["widow", "siren", "heiress", "muse", "dispatch"]) {
    assert.ok(isCrmSegment(segment));
    assert.equal(contactSegment(canonicalArchetype(segment)), segment);
  }
  assert.equal(contactSegment("widow"), "widow");
  assert.equal(contactSegment(null), "dispatch");
  assert.equal(isCrmSegment("__proto__"), false);
});

test("seed catalog, local VIP lifecycle, and SEO counts", async () => {
  const original = process.cwd();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "oxblood-admin-test-"));
  process.chdir(dir);
  try {
    const db = await import("../lib/db");
    const articles = await db.getAllArticles();
    assert.equal(articles.length, 9);
    assert.equal(new Set(articles.map((a) => a.created_at)).size, 9);
    for (const article of articles) {
      const audit = auditArticle(article);
      assert.ok(audit.words > 100, article.slug);
      assert.ok(audit.figures >= 1, article.slug);
      assert.ok(audit.internalLinks >= 2, article.slug);
      assert.match(article.content_html!, /editorial-standards/);
    }
    const products = await db.getAllProducts();
    assert.equal(products.length, 2);
    assert.equal(products[0].price, 27);
    assert.equal(products[1].price, 19);
    assert.equal(products[0].gumroad_url, PRODUCT_SEEDS["the-oxblood-code"].gumroad_url);
    const affiliates = await db.getAffiliateLinks();
    assert.equal(affiliates.length, 6);
    assert.ok(affiliates.every((a) => a.image && a.price_uk?.startsWith("£") && a.price_us?.startsWith("$") && a.clicks === 0));
    await assert.rejects(() => db.syncSeedCatalog(), /DATABASE_URL/);
    await db.addSubscriberAdmin({ email: " VIP@example.com ", archetype: "widow", source: "admin-vip" });
    let contacts = await db.getSubscribers();
    assert.equal(contacts.length, 1);
    assert.equal(contacts[0].email, "vip@example.com");
    assert.equal(contacts[0].archetype, "velvet-widow");
    assert.equal(contacts[0].status, "pending");
    assert.equal(contacts[0].confirmed_at, null);
    assert.deepEqual(crmCsvCells(contacts[0]), ["vip@example.com", "widow", "admin-vip", contacts[0].consented_at]);
    await db.setSubscriberStatus(contacts[0].id, "unsubscribed");
    await db.addSubscriberAdmin({ email: "VIP@example.com", archetype: "siren", source: "another-import" });
    contacts = await db.getSubscribers();
    assert.equal(contacts.length, 1);
    assert.equal(contacts[0].status, "unsubscribed");
    assert.equal(contacts[0].source, "admin-vip");
    await assert.rejects(() => db.addSubscriberAdmin({ email: "invalid", archetype: "widow", source: "vip" }));
    await db.deleteSubscriberById(contacts[0].id);
    assert.equal((await db.getSubscribers()).length, 0);
    const target = affiliates[0];
    assert.equal(await db.recordAffiliateClick(target.id), target.url);
    assert.equal((await db.getAffiliateLinks()).find((a) => a.id === target.id)?.clicks, 1);
    const without = { ...articles[0], content_html: '<script>ignore these words</script><p>Two words</p><figure><img src="/x" /></figure><a href="https://example.com">External</a>', meta_title: null, meta_description: null };
    const audit = auditArticle(without);
    assert.equal(audit.words, 3);
    assert.equal(audit.figures, 0);
    assert.equal(audit.internalLinks, 0);
    assert.ok(audit.score < 100);
  } finally {
    process.chdir(original);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("CSV escapes commas, quotes, newlines and spreadsheet formulas", () => {
  assert.equal(csvCell('VIP, "A"'), '"VIP, ""A"""');
  assert.equal(csvCell("line\nnext"), '"line\nnext"');
  assert.equal(csvCell("=SUM(1)"), "'=SUM(1)");
  assert.equal(csvCell("+command"), "'+command");
  assert.equal(csvCell(null), "");
});
