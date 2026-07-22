import type { Region } from "../dataset/index.js";
import { normalizeRegionText } from "../query/text-matching.js";

export interface MemoryIndexes {
  readonly byId: ReadonlyMap<string, Region>;

  readonly byCode: ReadonlyMap<string, readonly Region[]>;

  readonly byNormalizedName: ReadonlyMap<string, readonly Region[]>;

  readonly byParentId: ReadonlyMap<string | null, readonly Region[]>;

  readonly byLevel: ReadonlyMap<number, readonly Region[]>;

  readonly byType: ReadonlyMap<string, readonly Region[]>;
}

type MutableMultiIndex<Key> = Map<Key, Region[]>;

function addToMultiIndex<Key>(
  index: MutableMultiIndex<Key>,
  key: Key,
  region: Region,
): void {
  const existing = index.get(key);

  if (existing === undefined) {
    index.set(key, [region]);
    return;
  }

  existing.push(region);
}

function freezeMultiIndex<Key>(
  index: MutableMultiIndex<Key>,
): ReadonlyMap<Key, readonly Region[]> {
  for (const regions of index.values()) {
    Object.freeze(regions);
  }

  return index;
}

export function buildMemoryIndexes(regions: readonly Region[]): MemoryIndexes {
  const byId = new Map<string, Region>();
  const byCode = new Map<string, Region[]>();
  const byNormalizedName = new Map<string, Region[]>();
  const byParentId = new Map<string | null, Region[]>();
  const byLevel = new Map<number, Region[]>();
  const byType = new Map<string, Region[]>();

  for (const region of regions) {
    byId.set(region.id, region);

    addToMultiIndex(byCode, region.code, region);
    addToMultiIndex(byParentId, region.parentId, region);
    addToMultiIndex(byLevel, region.level, region);
    addToMultiIndex(byType, region.type, region);

    const normalizedNames = new Set<string>();

    normalizedNames.add(normalizeRegionText(region.name));

    for (const alias of region.aliases ?? []) {
      normalizedNames.add(normalizeRegionText(alias));
    }

    for (const normalizedName of normalizedNames) {
      addToMultiIndex(byNormalizedName, normalizedName, region);
    }
  }

  return Object.freeze({
    byId,
    byCode: freezeMultiIndex(byCode),
    byNormalizedName: freezeMultiIndex(byNormalizedName),
    byParentId: freezeMultiIndex(byParentId),
    byLevel: freezeMultiIndex(byLevel),
    byType: freezeMultiIndex(byType),
  });
}
