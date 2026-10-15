import assert from "node:assert/strict";
import { before, test } from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// An isolated local store: no Neon, no real subscribers, a fresh working directory.
delete process.env.DATABASE_URL;
delete process.env.NEXT_PUBLIC_SITE_URL;
process.chdir(fs.mkdtempSync(path.join(os.tmpdir(), "oxblood-subscribe-test-")));

let POST: typeof import("../app/api/subscribe/route").POST;
let getSubscribers: typeof import("../lib/db").getSubscribers;

before(async () => {
  ({ POST } = await import("../app/api/subscribe/route"));
  ({ getSubscribers } = await import("../lib/db"));
});

let reader = 0;
function request(body: string, contentType: string) {
  reader += 1; // one IP per request, so the per-IP rate limit stays out of the way
  return new Request("http://localhost:3000/api/subscribe", {
    method: "POST",
    headers: { "content-type": contentType, "x-forwarded-for": `203.0.113.${reader}` },
    body
  });
}
const asJson = (payload: Record<string, unknown>) => request(JSON.stringify(payload), "application/json");
const asForm = (fields: Record<string, string>) =>
  request(new URLSearchParams(fields).toString(), "application/x-www-form-urlencoded");

async function stored(email: string) {
  return (await getSubscribers()).find((row) => row.email === email) ?? null;
}

test("JSON: no tick, no record — and a tick is stored with its wording", async () => {
  const refused = await POST(asJson({ email: "json@example.com", consent: false, source: "homepage" }));
  assert.equal(refused.status, 400);
  assert.equal((await refused.json()).code, "consent_required");
  assert.equal(await stored("json@example.com"), null);

  const accepted = await POST(
    asJson({ email: " JSON@Example.com ", consent: true, source: "homepage", company: "" })
  );
  assert.equal(accepted.status, 200);
  const body = await accepted.json();
  assert.equal(body.ok, true);
  assert.equal(body.status, "pending");
  const row = await stored("json@example.com");
  assert.equal(row?.status, "pending");
  assert.equal(row?.source, "homepage");
  assert.match(row?.consent_text ?? "", /^I agree to The Oxblood Edit/);
});

test("plain form post (before hydration / no JavaScript) lands on a page, not raw JSON", async () => {
  const accepted = await POST(
    asForm({
      email: "native@example.com",
      consent: "on",
      source: "villainess-quiz",
      archetype: "velvet-widow",
      company: ""
    })
  );
  assert.equal(accepted.status, 303);
  const location = new URL(accepted.headers.get("location") ?? "");
  assert.equal(location.pathname, "/subscribed");
  assert.equal(location.searchParams.get("state"), "pending");
  assert.equal(location.searchParams.get("archetype"), "velvet-widow");
  assert.ok(!location.search.includes("native"), "the address never travels in the URL");
  const row = await stored("native@example.com");
  assert.equal(row?.archetype, "velvet-widow");
  assert.equal(row?.source, "villainess-quiz");
});

test("plain form post without the tick is refused onto an explanatory page", async () => {
  const refused = await POST(asForm({ email: "unticked@example.com", source: "footer", company: "" }));
  assert.equal(refused.status, 303);
  const location = new URL(refused.headers.get("location") ?? "");
  assert.equal(location.pathname, "/subscribed");
  assert.equal(location.searchParams.get("state"), "consent_required");
  assert.equal(location.searchParams.get("source"), "footer");
  assert.ok(!location.search.includes("unticked"));
  assert.equal(await stored("unticked@example.com"), null);

  const badAddress = await POST(asForm({ email: "not-an-address", consent: "on", source: "nowhere" }));
  const badLocation = new URL(badAddress.headers.get("location") ?? "");
  assert.equal(badLocation.searchParams.get("state"), "invalid_email");
  assert.equal(badLocation.searchParams.has("source"), false, "unknown sources are not echoed");
});

test("honeypot posts are accepted and discarded either way", async () => {
  const json = await POST(asJson({ email: "bot@example.com", consent: true, company: "Bots Ltd" }));
  assert.deepEqual(await json.json(), { ok: true, status: "pending" });
  const form = await POST(asForm({ email: "bot2@example.com", consent: "on", company: "Bots Ltd" }));
  assert.equal(form.status, 303);
  assert.equal(new URL(form.headers.get("location") ?? "").searchParams.get("state"), "pending");
  assert.equal(await stored("bot@example.com"), null);
  assert.equal(await stored("bot2@example.com"), null);
});

test("a sign-up that cannot be stored is refused, never reported as recorded", async () => {
  // A file where the store's directory should be: writes fail as on Vercel's read-only disk.
  fs.rmSync(".data", { recursive: true, force: true });
  fs.writeFileSync(".data", "");
  try {
    const json = await POST(asJson({ email: "unstored@example.com", consent: true, source: "homepage" }));
    assert.equal(json.status, 500);
    assert.deepEqual(await json.json(), {
      ok: false,
      code: "server_error",
      message: "The desk could not record that just now. Please try again shortly."
    });
    const form = await POST(asForm({ email: "unstored@example.com", consent: "on", source: "footer" }));
    assert.equal(form.status, 303);
    assert.equal(new URL(form.headers.get("location") ?? "").searchParams.get("state"), "server_error");
  } finally {
    fs.rmSync(".data", { force: true });
  }
});
