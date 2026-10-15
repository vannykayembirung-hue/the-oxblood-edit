import assert from "node:assert/strict";
import { before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { neonConfig } from "@neondatabase/serverless";
import { createNeonOverPglite, type NeonOverPglite } from "./helpers/neon-over-pglite";

/*
 * The Neon subscriber path, run against a real Postgres engine (see the helper).
 *
 * The production failure behind "The desk could not record that just now": a
 * Neon database set up from neon.sql before the newsletter existed has no
 * subscribers table, so every sign-up threw 42P01 and was refused.
 */

process.env.DATABASE_URL = "postgresql://test:test@ep-test.us-east-2.aws.neon.tech/test";
process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "oxblood-neon-subscribers-")));

const NEON_SQL = fs
  .readFileSync(path.join(__dirname, "..", "neon.sql"), "utf8")
  .replace("create extension if not exists pgcrypto;", ""); // gen_random_uuid() is core Postgres
const TABLE_END = "(consented_at desc);";
const NEON_SQL_SUBSCRIBERS = NEON_SQL.slice(
  NEON_SQL.indexOf("create table if not exists subscribers"),
  NEON_SQL.indexOf(TABLE_END) + TABLE_END.length
);

let neon: NeonOverPglite;
let POST: typeof import("../app/api/subscribe/route").POST;
let db: typeof import("../lib/db");

before(async () => {
  neon = await createNeonOverPglite();
  await neon.pg.exec(NEON_SQL);
  // The table exactly as neon.sql defines it, kept aside to compare against.
  await neon.pg.exec(`create schema reference; set search_path to reference; ${NEON_SQL_SUBSCRIBERS}; reset search_path;`);
  neonConfig.fetchFunction = neon.fetchFunction;
  ({ POST } = await import("../app/api/subscribe/route"));
  db = await import("../lib/db");
});

let reader = 0;
async function subscribe(email: string, extra: Record<string, unknown> = {}) {
  reader += 1; // one IP per request, so the per-IP rate limit stays out of the way
  const response = await POST(
    new Request("http://localhost:3000/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${reader}` },
      body: JSON.stringify({ email, consent: true, source: "homepage", ...extra })
    })
  );
  return { status: response.status, body: await response.json() };
}

/** Columns, defaults, nullability and indexes of `<schema>.subscribers`. */
async function tableShape(schema: string) {
  const columns = await neon.pg.query(
    `select column_name, data_type, column_default, is_nullable
     from information_schema.columns where table_schema = $1 and table_name = 'subscribers'
     order by column_name`,
    [schema]
  );
  const indexes = await neon.pg.query(
    `select indexname, regexp_replace(indexdef, ' ON \\S+ ', ' ON subscribers ') as definition
     from pg_indexes where schemaname = $1 and tablename = 'subscribers' order by indexname`,
    [schema]
  );
  return { columns: columns.rows, indexes: indexes.rows };
}

async function rowFor(email: string) {
  const { rows } = await neon.pg.query<Record<string, unknown>>(
    "select * from subscribers where email = $1",
    [email]
  );
  return rows[0] ?? null;
}

const ddlSince = (mark: number) => neon.statements.slice(mark).filter((s) => /^(create|alter|drop)\b/i.test(s));

test("a Neon database set up before the newsletter: the first sign-up creates the table and is recorded", async () => {
  await neon.pg.exec("drop table subscribers");
  const mark = neon.statements.length;

  const { status, body } = await subscribe("first.reader@example.com", { archetype: "library-siren" });

  assert.equal(status, 200, JSON.stringify(body));
  assert.equal(body.ok, true);
  assert.equal(body.status, "pending");
  assert.deepEqual(await tableShape("public"), await tableShape("reference"));
  assert.equal(ddlSince(mark).filter((s) => s.startsWith("create table")).length, 1);

  const row = await rowFor("first.reader@example.com");
  assert.equal(row?.status, "pending");
  assert.equal(row?.source, "homepage");
  assert.equal(row?.archetype, "library-siren");
  assert.match(String(row?.consent_text), /^I agree to The Oxblood Edit/);
  assert.ok(row?.consent_version && row?.confirm_token && row?.unsubscribe_token && row?.consented_at);
});

test("with the neon.sql table in place, no DDL runs and the whole consent lifecycle works", async () => {
  await neon.pg.exec(`drop table subscribers; ${NEON_SQL_SUBSCRIBERS}`);
  const mark = neon.statements.length;

  // The dashboard check looks afresh and finds nothing to repair.
  assert.deepEqual(await db.getDatabaseHealth(), { mode: "neon", connected: true, missingTables: [] });

  const email = "lifecycle@example.com";
  assert.equal((await subscribe(email)).body.status, "pending");
  assert.equal((await subscribe(email, { source: "footer" })).body.status, "pending"); // consent renewed, still one row
  const first = await rowFor(email);
  assert.equal(first?.source, "footer");

  const confirmed = await db.confirmSubscriberByToken(String(first?.confirm_token));
  assert.equal(confirmed?.status, "confirmed");
  assert.ok(confirmed?.confirmed_at);
  const again = await subscribe(email);
  assert.equal(again.body.alreadyConfirmed, true);
  assert.equal(again.body.status, "confirmed");

  const withdrawn = await db.unsubscribeSubscriber({ token: String(first?.unsubscribe_token) });
  assert.equal(withdrawn?.status, "unsubscribed");
  assert.ok(withdrawn?.unsubscribed_at);
  const renewed = await subscribe(email);
  assert.equal(renewed.body.status, "pending"); // a fresh tick after withdrawal starts over
  assert.equal((await rowFor(email))?.unsubscribed_at, null);

  await db.setSubscriberStatus(String(first?.id), "confirmed");
  assert.equal((await rowFor(email))?.status, "confirmed");
  await db.unsubscribeSubscriber({ email: " LifeCycle@Example.com " });
  assert.equal((await rowFor(email))?.status, "unsubscribed");

  await db.addSubscriberAdmin({ email: "vip@example.com", archetype: "widow", source: "Paris salon" });
  await db.addSubscriberAdmin({ email: email, archetype: "muse", source: "Paris salon" }); // never overwrites a contact
  const vip = await rowFor("vip@example.com");
  assert.equal(vip?.status, "pending");
  assert.equal(vip?.consent_version, "admin-vip/pending");
  assert.equal((await rowFor(email))?.status, "unsubscribed");

  const listed = await db.getSubscribers();
  assert.deepEqual(listed.map((s) => s.email).sort(), ["lifecycle@example.com", "vip@example.com"]);
  await db.deleteSubscriberById(String(vip?.id));
  assert.equal(await rowFor("vip@example.com"), null);

  assert.deepEqual(ddlSince(mark), []);
});

test("a subscribers table missing newer columns is completed in place, keeping its rows", async () => {
  await neon.pg.exec(`
    drop table subscribers;
    create table subscribers (
      id uuid primary key default gen_random_uuid(),
      email text not null,
      archetype text,
      source text default 'unknown',
      status text default 'pending',
      consented_at timestamp default now()
    );
    insert into subscribers (email, source) values ('kept@example.com', 'footer');
  `);
  const before = await rowFor("kept@example.com");

  // This instance already checked the table once, so the repair comes from the
  // retry on "column does not exist".
  const { status, body } = await subscribe("kept@example.com");

  assert.equal(status, 200, JSON.stringify(body));
  assert.deepEqual(await tableShape("public"), await tableShape("reference"));
  const { rows } = await neon.pg.query<Record<string, unknown>>("select * from subscribers");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, before?.id);
  assert.match(String(rows[0].consent_text), /^I agree to The Oxblood Edit/);
  assert.ok(rows[0].confirm_token && rows[0].unsubscribe_token, "an older row gains the tokens its links need");
  assert.equal((await db.confirmSubscriberByToken(String(rows[0].confirm_token)))?.status, "confirmed");
});

test("the dashboard names what is wrong; a sign-up Neon refuses is still never reported as recorded", async () => {
  await neon.pg.exec("alter table products rename to products_before_restore");
  assert.deepEqual(await db.getDatabaseHealth(), { mode: "neon", connected: true, missingTables: ["products"] });
  await neon.pg.exec("alter table products_before_restore rename to products");

  neonConfig.fetchFunction = async () =>
    new Response(JSON.stringify({ message: 'password authentication failed for user "neondb_owner"', code: "28P01" }), {
      status: 400
    });
  try {
    const health = await db.getDatabaseHealth();
    assert.equal(health.mode, "neon");
    assert.equal("connected" in health && health.connected, false);
    assert.match("error" in health ? health.error : "", /password authentication failed/);

    const { status, body } = await subscribe("refused@example.com");
    assert.equal(status, 500);
    assert.equal(body.code, "server_error");
    assert.equal(body.message, "The desk could not record that just now. Please try again shortly.");
  } finally {
    neonConfig.fetchFunction = neon.fetchFunction;
  }
});
