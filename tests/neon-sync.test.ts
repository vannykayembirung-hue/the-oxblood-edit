import assert from "node:assert/strict";
import { test } from "node:test";
import { neonConfig } from "@neondatabase/serverless";

// Neon HTTP transport stub: inspects the atomic transaction without network access.
process.env.DATABASE_URL = "postgresql://test:test@ep-test.us-east-2.aws.neon.tech/test";

test("sync batches 9 articles + 2 products + 6 affiliates and preserves clicks", async () => {
  const requests: { queries: { query: string; params: string[] }[] }[] = [];
  const previous = neonConfig.fetchFunction;
  neonConfig.fetchFunction = async (_url: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    requests.push(body);
    return new Response(JSON.stringify({ results: body.queries.map(() => ({ fields: [], rows: [], rowCount: 1, command: "INSERT" })) }), { status: 200 });
  };
  try {
    const { syncSeedCatalog } = await import("../lib/db");
    await syncSeedCatalog();
    await syncSeedCatalog();
    assert.equal(requests.length, 2); // one request per sync, no separately awaited writes
    assert.equal(requests[0].queries.length, 17);
    assert.deepEqual(requests[0], requests[1]); // stable keys and dates
    const queries = requests[0].queries;
    assert.equal(queries.filter((q) => /insert into articles/.test(q.query)).length, 9);
    assert.equal(queries.filter((q) => /insert into products/.test(q.query)).length, 2);
    for (const query of queries.filter((q) => /insert into affiliate_links/.test(q.query))) {
      assert.match(query.query, /with existing as/);
      assert.match(query.query, /where not exists/);
      assert.match(query.query, /on conflict \(id\) do update/);
      assert.doesNotMatch(query.query.split("do update")[1], /clicks\s*=/);
    }
    assert.ok(queries.every((q) => !q.query.includes("subscribers")));
    neonConfig.fetchFunction = async () => new Response(JSON.stringify({ message: "transaction rejected", code: "23505" }), { status: 400 });
    await assert.rejects(() => syncSeedCatalog(), /transaction rejected/);
  } finally {
    neonConfig.fetchFunction = previous;
  }
});
