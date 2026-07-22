import type { TextMatch } from "./types.js";

export function normalizeRegionText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase();
}

export function matchesRegionText(
  value: string,
  normalizedQuery: string,
  match: TextMatch,
): boolean {
  const normalizedValue = normalizeRegionText(value);

  switch (match) {
    case "exact":
      return normalizedValue === normalizedQuery;
    case "prefix":
      return normalizedValue.startsWith(normalizedQuery);
    case "contains":
      return normalizedValue.includes(normalizedQuery);
  }
}
