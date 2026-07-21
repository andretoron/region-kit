import { describe, expect, it } from "vitest";
import {
  regionStoreContractDataset,
  regionStoreContractMetadata,
} from "../../test/contract/region-store-contract-dataset.js";
import { prepareMemoryDataset } from "./prepare-memory-dataset.js";
import { DatasetValidationError } from "../errors/index.js";

describe("prepareMemoryDataset", () => {
  it("validates and prepares a memory dataset", () => {
    const input = structuredClone(regionStoreContractDataset);

    const prepared = prepareMemoryDataset(input);
    expect(prepared.metadata).toEqual(regionStoreContractMetadata);
    expect(prepared.regions).toEqual(input.regions);
    expect(prepared.regions).not.toBe(input.regions);
    expect(prepared).not.toHaveProperty("schemaVersion");
  });

  it("rejects an invalid dataset", () => {
    expect(() => prepareMemoryDataset({})).toThrow(DatasetValidationError);
  });

  it("validates before attempting to clone regions", () => {
    const invalidInput = {
      uncloneableValue: () => undefined,
    };

    expect(() => prepareMemoryDataset(invalidInput)).toThrow(
      DatasetValidationError,
    );
  });

  it("does not mutate the input", () => {
    const input = structuredClone(regionStoreContractDataset);
    const before = structuredClone(input);

    prepareMemoryDataset(input);

    expect(input).toEqual(before);
  });

  it("detaches nested region data from the input", () => {
    const input = structuredClone(regionStoreContractDataset);

    const prepared = prepareMemoryDataset(input);

    const inputRegion = input.regions[2];
    const preparedRegion = prepared.regions[2];

    expect(preparedRegion).not.toBe(inputRegion);
    expect(preparedRegion?.aliases).not.toBe(inputRegion?.aliases);
    expect(preparedRegion?.attributes).not.toBe(inputRegion?.attributes);
  });

  it("is unaffected by later input mutations", () => {
    const input = structuredClone(regionStoreContractDataset);

    const prepared = prepareMemoryDataset(input);

    const mutableRegion = input.regions[2] as unknown as {
      name: string;
      aliases: string[];
      attributes: Record<string, unknown>;
    };

    mutableRegion.name = "Mutated";
    mutableRegion.aliases[0] = "Mutated Alias";
    mutableRegion.attributes.category = "mutated";

    expect(prepared.regions[2]).toEqual(
      expect.objectContaining({
        name: "Kota Bandung",
        aliases: ["Bandung"],
        attributes: {
          category: "urban",
        },
      }),
    );
  });

  it("freezes the prepared container and regions array", () => {
    const prepared = prepareMemoryDataset(
      structuredClone(regionStoreContractDataset),
    );

    expect(Object.isFrozen(prepared)).toBe(true);
    expect(Object.isFrozen(prepared.regions)).toBe(true);
  });
});
