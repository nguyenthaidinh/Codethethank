import type { Channel } from "./direction";
export const INSPECTION_KEY = "project2011.future-inspection.v1";
export function readInspection(raw: string | null): Channel[] {
  try {
    const v = JSON.parse(raw ?? "null");
    if (
      v?.version !== 1 ||
      !Array.isArray(v.found) ||
      v.found.some((s: unknown) => s !== "source" && s !== "limit")
    )
      return [];
    return [...new Set<Channel>(v.found)];
  } catch {
    return [];
  }
}
