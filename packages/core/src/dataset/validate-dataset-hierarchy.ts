import {
  DatasetValidationError,
  type DatasetValidationIssue,
} from "../errors/index.js";
import type { Region, RegionDataset } from "./types.js";

interface IndexedRegion {
  readonly index: number;
  readonly region: Region;
}

interface RegionHierarchyIndex {
  readonly byId: ReadonlyMap<string, IndexedRegion>;
  readonly roots: readonly IndexedRegion[];
  readonly duplicateIds: ReadonlySet<string>;
}

function buildRegionHierarchyIndex(
  regions: readonly Region[],
  issues: DatasetValidationIssue[],
): RegionHierarchyIndex {
  const byId = new Map<string, IndexedRegion>();
  const roots: IndexedRegion[] = [];
  const duplicateIds = new Set<string>();

  regions.forEach((region, index) => {
    const indexedRegion: IndexedRegion = {
      index,
      region,
    };

    if (region.parentId === null) {
      roots.push(indexedRegion);
    }

    const existingRegion = byId.get(region.id);

    if (existingRegion !== undefined) {
      duplicateIds.add(region.id);

      issues.push({
        code: "DUPLICATE_REGION_ID",
        path: ["regions", index, "id"],
        message:
          `Region id "${region.id}" duplicates the region ` +
          `at index ${existingRegion.index}.`,
      });

      return;
    }

    byId.set(region.id, indexedRegion);
  });

  return {
    byId,
    roots,
    duplicateIds,
  };
}

function validateRoot(
  roots: readonly IndexedRegion[],
  issues: DatasetValidationIssue[],
): void {
  if (roots.length !== 1) {
    issues.push({
      code: "INVALID_ROOT_COUNT",
      path: ["regions"],
      message:
        `Dataset must contain exactly one root region, ` +
        `but found ${roots.length}.`,
    });

    return;
  }

  const root = roots[0];

  if (root === undefined) {
    return;
  }

  validateRootRegion(root, issues);
}

function validateRootRegion(
  root: IndexedRegion,
  issues: DatasetValidationIssue[],
): void {
  if (root.region.level !== 0) {
    issues.push({
      code: "INVALID_ROOT_REGION",
      path: ["regions", root.index, "level"],
      message: "The root region must have level 0.",
    });
  }

  if (root.region.type !== "country") {
    issues.push({
      code: "INVALID_ROOT_REGION",
      path: ["regions", root.index, "type"],
      message: 'The root region must have type "country".',
    });
  }
}

function validateParentReferences(
  regions: readonly Region[],
  byId: ReadonlyMap<string, IndexedRegion>,
  issues: DatasetValidationIssue[],
): void {
  regions.forEach((region, index) => {
    const parentId = region.parentId;

    if (parentId === null) {
      return;
    }

    const path = ["regions", index, "parentId"] as const;

    if (parentId === region.id) {
      issues.push({
        code: "SELF_PARENT",
        path,
        message: `Region "${region.id}" cannot be its own parent.`,
      });

      return;
    }

    if (!byId.has(parentId)) {
      issues.push({
        code: "UNKNOWN_PARENT",
        path,
        message:
          `Region "${region.id}" references unknown parent ` + `"${parentId}".`,
      });
    }
  });
}

function validateChildLevels(
  regions: readonly Region[],
  byId: ReadonlyMap<string, IndexedRegion>,
  duplicateIds: ReadonlySet<string>,
  issues: DatasetValidationIssue[],
): void {
  regions.forEach((region, index) => {
    const parentId = region.parentId;

    if (parentId === null) {
      return;
    }

    if (parentId === region.id) {
      return;
    }

    if (duplicateIds.has(parentId)) {
      return;
    }

    const parent = byId.get(parentId);

    if (parent === undefined) {
      return;
    }

    if (region.level <= parent.region.level) {
      issues.push({
        code: "INVALID_CHILD_LEVEL",
        path: ["regions", index, "level"],
        message:
          `Region "${region.id}" must have a level greater than ` +
          `its parent "${parentId}".`,
      });
    }
  });
}

function createCycleMessage(cycle: readonly IndexedRegion[]): string {
  const ids = cycle.map(({ region }) => region.id);
  const firstId = ids[0];

  if (firstId !== undefined) {
    ids.push(firstId);
  }

  return `Hierarchy cycle detected: ${ids.join(" -> ")}.`;
}

function validateHierarchyCycles(
  regions: readonly Region[],
  byId: ReadonlyMap<string, IndexedRegion>,
  duplicateIds: ReadonlySet<string>,
  issues: DatasetValidationIssue[],
): void {
  const completed = new Set<string>();

  regions.forEach((startRegion, startIndex) => {
    if (duplicateIds.has(startRegion.id)) {
      return;
    }

    if (completed.has(startRegion.id)) {
      return;
    }

    const path: IndexedRegion[] = [];
    const pathPositions = new Map<string, number>();

    let current: IndexedRegion | undefined = {
      index: startIndex,
      region: startRegion,
    };

    while (current !== undefined) {
      const currentId = current.region.id;

      if (duplicateIds.has(currentId)) {
        break;
      }

      if (completed.has(currentId)) {
        break;
      }

      const existingPosition = pathPositions.get(currentId);

      if (existingPosition !== undefined) {
        const cycle = path.slice(existingPosition);
        const closingRegion = path[path.length - 1];

        if (closingRegion !== undefined) {
          issues.push({
            code: "HIERARCHY_CYCLE",
            path: ["regions", closingRegion.index, "parentId"],
            message: createCycleMessage(cycle),
          });
        }

        break;
      }

      pathPositions.set(currentId, path.length);
      path.push(current);

      const parentId = current.region.parentId;

      if (parentId === null) {
        break;
      }

      if (parentId === currentId) {
        break;
      }

      if (duplicateIds.has(parentId)) {
        break;
      }

      current = byId.get(parentId);
    }

    path.forEach(({ region }) => {
      completed.add(region.id);
    });
  });
}

export function validateDatasetHierarchy(
  dataset: RegionDataset,
): RegionDataset {
  const issues: DatasetValidationIssue[] = [];

  const index = buildRegionHierarchyIndex(dataset.regions, issues);

  validateRoot(index.roots, issues);

  validateParentReferences(dataset.regions, index.byId, issues);

  validateChildLevels(dataset.regions, index.byId, index.duplicateIds, issues);

  validateHierarchyCycles(
    dataset.regions,
    index.byId,
    index.duplicateIds,
    issues,
  );

  if (issues.length > 0) {
    throw new DatasetValidationError(issues);
  }

  return dataset;
}
