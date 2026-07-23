import { describe, expect, it } from "vitest";

import { matchesRegionText, normalizeRegionText } from "./text-matching.js";

describe("normalizeRegionText", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeRegionText("  JAWA   BARAT ")).toBe("jawa barat");
  });

  it("normalizes Unicode compatibility forms", () => {
    expect(normalizeRegionText("\uFF21")).toBe("a");
  });
});

describe("matchesRegionText", () => {
  it("supports exact matching", () => {
    expect(matchesRegionText("Jawa Barat", "jawa barat", "exact")).toBe(true);
    expect(matchesRegionText("Jawa Barat", "jawa", "exact")).toBe(false);
  });

  it("supports prefix matching", () => {
    expect(matchesRegionText("Jawa Barat", "jawa", "prefix")).toBe(true);
    expect(matchesRegionText("Jawa Barat", "barat", "prefix")).toBe(false);
  });

  it("supports contains matching", () => {
    expect(matchesRegionText("Jawa Barat", "barat", "contains")).toBe(true);
    expect(matchesRegionText("Jawa Barat", "timur", "contains")).toBe(false);
  });
});
