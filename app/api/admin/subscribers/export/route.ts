import { csvCell, crmCsvCells } from "@/lib/admin-csv";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSubscribers } from "@/lib/db";
import { ARCHETYPES } from "@/lib/villainess-quiz";
import { isArchetypeKey } from "@/lib/newsletter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/subscribers/export — the editorial desk's own mailing list.
 *
 * Guarded by the same NextAuth session as `/admin`. Exports the consent record
 * as well as the address: an editor importing this into a mail provider must be
 * able to show what each reader actually agreed to.
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, code: "unauthorized" }, { status: 401 });
  }

  const subscribers = await getSubscribers();
  const crm = new URL(request.url).searchParams.get("format") === "crm";
  const header = crm ? ["email", "archetype", "source", "created_at"] : [
    "email",
    "archetype",
    "archetype_name",
    "source",
    "status",
    "consented_at",
    "confirmed_at",
    "unsubscribed_at",
    "consent_version",
    "consent_text"
  ];

  const rows = subscribers.map((subscriber) => {
    const archetypeName =
      subscriber.archetype && isArchetypeKey(subscriber.archetype)
        ? ARCHETYPES[subscriber.archetype].name
        : "";
    const cells = crm ? crmCsvCells(subscriber) : [
      subscriber.email,
      subscriber.archetype,
      archetypeName,
      subscriber.source,
      subscriber.status,
      subscriber.consented_at,
      subscriber.confirmed_at,
      subscriber.unsubscribed_at,
      subscriber.consent_version,
      subscriber.consent_text
    ];
    return cells
      .map(csvCell)
      .join(",");
  });

  const csv = `${header.join(",")}\r\n${rows.join("\r\n")}\r\n`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="oxblood-subscribers-${stamp}.csv"`,
      "cache-control": "no-store"
    }
  });
}
