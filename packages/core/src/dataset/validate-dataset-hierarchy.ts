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
}

function buildRegionHierarchyIndex(
  regions: readonly Region[],
  issues: DatasetValidationIssue[],
): RegionHierarchyIndex {
  const byId = new Map<string, IndexedRegion>();
  const roots: IndexedRegion[] = [];

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

function validateParentReference(
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

export function validateDatasetHierarchy(
  dataset: RegionDataset,
): RegionDataset {
  const issues: DatasetValidationIssue[] = [];

  const index = buildRegionHierarchyIndex(dataset.regions, issues);

  validateRoot(index.roots, issues);

  validateParentReference(dataset.regions, index.byId, issues);

  if (issues.length > 0) {
    throw new DatasetValidationError(issues);
  }

  return dataset;
}
