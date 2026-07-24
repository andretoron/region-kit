import { describe, expect, it } from "vitest";
import { regionStoreContractDataset } from "../../test/contract/region-store-contract-dataset.js";
import { buildMemoryIndexes } from "./memory-indexes.js";
import { prepareMemoryDataset } from "./prepare-memory-dataset.js";
import { normalizeRegionText } from "../query/text-matching.js";

function createIndexes() {
  const prepared = prepareMemoryDataset(
    structuredClone(regionStoreContractDataset),
  );

  return {
    prepared,
    indexes: buildMemoryIndexes(prepared.regions),
  };
}

describe("normalizeRegionText", () => {
  it("normalizes case and whitespace", () => {
    expect(normalizeRegionText(" JAWA   BARAT  ")).toBe("jawa barat");
  });

  it("normalizes Unicode compatibility forms", () => {
    expect(normalizeRegionText("Ｋｏｔａ")).toBe("kota");
  });
});

describe("buildMemoryIndexes", () => {
  it("indexes every region by id", () => {
    const { prepared, indexes } = createIndexes();

    expect(indexes.byId.size).toBe(prepared.regions.length);

    expect(indexes.byId.get("ID-JB")).toBe(prepared.regions[1]);
  });

  it("indexes multiple regions with the same code", () => {
    const { indexes } = createIndexes();

    expect(indexes.byCode.get("01")?.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG-DISTRICT",
      "ID-JB-REG-BDG-DISTRICT",
    ]);
  });

  it("indexes primary names and aliases", () => {
    const { indexes } = createIndexes();

    expect(
      indexes.byNormalizedName.get("jawa barat")?.map((region) => region.id),
    ).toEqual(["ID-JB"]);

    expect(
      indexes.byNormalizedName.get("bandung")?.map((region) => region.id),
    ).toEqual(["ID-JB-CITY-BDG", "ID-JB-REG-BDG"]);
  });

  it("indexes direct children by parent id", () => {
    const { indexes } = createIndexes();

    expect(indexes.byParentId.get("ID-JB")?.map((region) => region.id)).toEqual(
      ["ID-JB-CITY-BDG", "ID-JB-REG-BDG"],
    );
  });

  it("indexes root regions under null", () => {
    const { indexes } = createIndexes();

    expect(indexes.byParentId.get(null)?.map((region) => region.id)).toEqual([
      "ID",
    ]);
  });

  it("indexes regions by level", () => {
    const { indexes } = createIndexes();

    expect(indexes.byLevel.get(2)?.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG",
      "ID-JB-REG-BDG",
    ]);
  });

  it("indexes regions by type", () => {
    const { indexes } = createIndexes();

    expect(indexes.byType.get("district")?.map((region) => region.id)).toEqual([
      "ID-JB-CITY-BDG-DISTRICT",
      "ID-JB-REG-BDG-DISTRICT",
    ]);
  });

  it("freezes multi-value index buckets", () => {
    const { indexes } = createIndexes();

    expect(Object.isFrozen(indexes.byCode.get("01"))).toBe(true);

    expect(Object.isFrozen(indexes.byNormalizedName.get("bandung"))).toBe(true);
  });

  it("does not duplicate a region for equivalent names", () => {
    const dataset = structuredClone(regionStoreContractDataset);

    const mutableRegion = dataset.regions[2] as unknown as {
      aliases: string[];
    };

    mutableRegion.aliases.push("  KOTA   BANDUNG  ");

    const prepared = prepareMemoryDataset(dataset);
    const indexes = buildMemoryIndexes(prepared.regions);

    expect(
      indexes.byNormalizedName.get("kota bandung")?.map((region) => region.id),
    ).toEqual(["ID-JB-CITY-BDG"]);
  });
});
