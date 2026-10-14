import { isArchetypeKey } from "@/lib/newsletter";

/** Admin segment aliases preserve the canonical quiz archetypes used by dossiers. */
export const CRM_SEGMENTS = {
  widow: "velvet-widow",
  siren: "library-siren",
  heiress: "crimson-heiress",
  muse: "thorned-muse",
  dispatch: null
} as const;
export type CrmSegment = keyof typeof CRM_SEGMENTS;
export function isCrmSegment(value: string): value is CrmSegment {
  return Object.prototype.hasOwnProperty.call(CRM_SEGMENTS, value);
}
export function contactSegment(archetype: string | null): CrmSegment {
  for (const [segment, canonical] of Object.entries(CRM_SEGMENTS)) {
    if (canonical && (archetype === canonical || archetype === segment)) return segment as CrmSegment;
  }
  return "dispatch";
}
export function canonicalArchetype(value: string): string | null {
  if (isCrmSegment(value)) return CRM_SEGMENTS[value];
  return isArchetypeKey(value) ? value : null;
}
