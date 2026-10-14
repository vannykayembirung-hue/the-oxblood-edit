import type { SubscriberRecord } from "@/lib/db";
import { contactSegment } from "@/lib/admin-crm";

/** RFC 4180 with spreadsheet formula neutralization. */
export function csvCell(value: string | null): string {
  const raw = value ?? "";
  const text = /^[=+@\-\t\r\n]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function crmCsvCells(subscriber: SubscriberRecord): string[] {
  // The current newsletter schema names its capture timestamp consented_at.
  // Map that existing capture date to the importer-facing created_at column.
  return [subscriber.email, contactSegment(subscriber.archetype), subscriber.source, subscriber.consented_at];
}
