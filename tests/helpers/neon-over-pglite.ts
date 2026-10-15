import { PGlite } from "@electric-sql/pglite";

/**
 * A real Postgres behind the Neon HTTP driver, for tests.
 *
 * PGlite is Postgres compiled to WebAssembly. Point `neonConfig.fetchFunction`
 * at `fetchFunction` and every `sql` query in lib/db.ts runs against it, in
 * Neon's wire format: values as raw Postgres text, rows as arrays, `{ results }`
 * for a transaction, and HTTP 400 carrying the SQLSTATE fields on error (which
 * the driver turns into a NeonDbError with `.code`).
 */

/** Every type the app reads back, left as Postgres text for the driver to parse. */
const RAW_TEXT_TYPES = [
  16, 17, 18, 19, 20, 21, 23, 25, 26, 114, 700, 701, 1042, 1043, 1082, 1083, 1114, 1184, 1186, 1700, 2950, 3802
];
const asRawText = Object.fromEntries(RAW_TEXT_TYPES.map((oid) => [oid, (value: string) => value]));

const ERROR_FIELDS = [
  "severity", "code", "detail", "hint", "position", "internalPosition", "internalQuery", "where",
  "schema", "table", "column", "dataType", "constraint", "file", "line", "routine"
] as const;

type Query = { query: string; params?: unknown[] };
type Queryable = Pick<PGlite, "query">;

export interface NeonOverPglite {
  pg: PGlite;
  /** Every statement received through the driver, whitespace collapsed, in order. */
  statements: string[];
  fetchFunction: (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
}

const json = (payload: unknown, status: number) =>
  new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } });

export async function createNeonOverPglite(): Promise<NeonOverPglite> {
  const pg = new PGlite();
  await pg.waitReady;
  const statements: string[] = [];

  const run = async (db: Queryable, { query, params = [] }: Query) => {
    statements.push(query.replace(/\s+/g, " ").trim());
    const result = await db.query<unknown[]>(query, params, { rowMode: "array", parsers: asRawText });
    return {
      fields: result.fields.map(({ name, dataTypeID }) => ({ name, dataTypeID })),
      rows: result.rows,
      command: "",
      rowCount: result.affectedRows ?? result.rows.length
    };
  };

  const fetchFunction = async (_input: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body)) as Query | { queries: Query[] };
    try {
      if ("queries" in body) {
        const results = await pg.transaction(async (tx) => {
          const out = [];
          for (const query of body.queries) out.push(await run(tx, query));
          return out;
        });
        return json({ results }, 200);
      }
      return json(await run(pg, body), 200);
    } catch (error) {
      const source = error as Record<string, unknown>;
      const payload: Record<string, unknown> = { message: error instanceof Error ? error.message : String(error) };
      for (const field of ERROR_FIELDS) if (source[field] !== undefined) payload[field] = source[field];
      return json(payload, 400);
    }
  };

  return { pg, statements, fetchFunction };
}
