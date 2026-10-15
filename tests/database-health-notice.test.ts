import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import DatabaseHealthNotice, { databaseBadge } from "../components/DatabaseHealthNotice";
import type { DatabaseHealth } from "../lib/db";

const render = (health: DatabaseHealth) =>
  renderToStaticMarkup(createElement(DatabaseHealthNotice, { health }))
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"');

test("silent when there is nothing to fix", () => {
  assert.equal(render({ mode: "neon", connected: true, missingTables: [] }), "");
  assert.equal(render({ mode: "local", persistent: true }), "");
  assert.deepEqual(databaseBadge({ mode: "neon", connected: true, missingTables: [] }), {
    label: "Neon PostgreSQL",
    healthy: true
  });
  assert.deepEqual(databaseBadge({ mode: "local", persistent: true }), { label: "Local Store Mode", healthy: true });
});

test("Neon refusing the connection: Neon's own words, the consequence and where to fix it", () => {
  const health: DatabaseHealth = {
    mode: "neon",
    connected: false,
    error: 'password authentication failed for user "neondb_owner"'
  };
  const text = render(health);
  assert.match(text, /Neon is not answering\./);
  assert.match(text, /password authentication failed for user "neondb_owner"/);
  assert.match(text, /The desk could not record that just now\./);
  assert.match(text, /Settings → Environment Variables \(Production and Preview\)/);
  assert.deepEqual(databaseBadge(health), { label: "Neon unreachable", healthy: false });
});

test("missing tables are named, and a missing subscribers table says sign-ups are refused", () => {
  const products = render({ mode: "neon", connected: true, missingTables: ["products", "users"] });
  assert.match(products, /Missing: products, users\. Run neon\.sql in the Neon SQL Editor/);
  assert.doesNotMatch(products, /sign-ups/);
  const subscribers = render({ mode: "neon", connected: true, missingTables: ["subscribers"] });
  assert.match(subscribers, /could not be created automatically, so newsletter sign-ups are refused/);
  assert.match(subscribers, /Could not prepare the Neon subscribers table/);
});

test("a Vercel deployment without DATABASE_URL is told nothing can be saved", () => {
  const health: DatabaseHealth = { mode: "local", persistent: false };
  const text = render(health);
  assert.match(text, /This deployment has no database\./);
  assert.match(text, /newsletter sign-ups are refused/);
  assert.match(text, /for Production and for Preview, then redeploy/);
  assert.deepEqual(databaseBadge(health), { label: "Local Store Mode", healthy: false });
});
