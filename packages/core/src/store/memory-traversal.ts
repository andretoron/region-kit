import type { Region } from "../dataset/index.js";

import type { MemoryIndexes } from "./memory-indexes.js";

export function findMemoryAncestors(
  region: Region,
  indexes: MemoryIndexes,
): readonly Region[] {
  const ancestors: Region[] = [];

  let parentId = region.parentId;

  while (parentId !== null) {
    const parent = indexes.byId.get(parentId);

    if (parent === undefined) {
      throw new Error(
        `Memory store invariant violated: parent "${parentId}" was not found.`,
      );
    }

    ancestors.push(parent);
    parentId = parent.parentId;
  }

  return ancestors;
}

export function findMemoryDescendants(
  regionId: string,
  indexes: MemoryIndexes,
  maxDepth?: number,
): readonly Region[] {
  if (maxDepth === 0) {
    return [];
  }

  const descendants: Region[] = [];

  let depth = 1;
  let currentLevel = [...(indexes.byParentId.get(regionId) ?? [])];

  while (
    currentLevel.length > 0 &&
    (maxDepth === undefined || depth <= maxDepth)
  ) {
    descendants.push(...currentLevel);

    const nextLevel: Region[] = [];

    for (const region of currentLevel) {
      nextLevel.push(...(indexes.byParentId.get(region.id) ?? []));
    }

    currentLevel = nextLevel;
    depth += 1;
  }

  return descendants;
}
