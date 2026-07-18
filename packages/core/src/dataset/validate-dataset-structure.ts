import {
  DatasetValidationError,
  type DatasetValidationIssue,
} from "../errors/index.js";

import { assertSupportedDatasetSchemaVersion } from "./schema-version.js";
import type { RegionDataset } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readRequiredString(
  record: Record<string, unknown>,
  field: string,
  parentPath: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): string | undefined {
  const path = [...parentPath, field];

  if (!Object.hasOwn(record, field)) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path,
      message: `${field} is required.`,
    });

    return undefined;
  }

  const value = record[field];

  if (typeof value !== "string") {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path,
      message: `${field} must be a string.`,
    });

    return undefined;
  }

  if (value.trim().length === 0) {
    issues.push({
      code: "INVALID_FIELD_VALUE",
      path,
      message: `${field} must not be empty.`,
    });

    return undefined;
  }

  return value;
}

function validateOptionalString(
  record: Record<string, unknown>,
  field: string,
  parentPath: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(record, field)) {
    return;
  }

  const path = [...parentPath, field];
  const value = record[field];

  if (typeof value !== "string") {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path,
      message: `${field} must be a string when provided.`,
    });

    return;
  }

  if (value.trim().length === 0) {
    issues.push({
      code: "INVALID_FIELD_VALUE",
      path,
      message: `${field} must not be empty when provided.`,
    });
  }
}

function validateSchemaVersion(
  dataset: Record<string, unknown>,
  issues: DatasetValidationIssue[],
): void {
  const value = readRequiredString(dataset, "schemaVersion", [], issues);

  if (value === undefined) {
    return;
  }

  try {
    assertSupportedDatasetSchemaVersion(value);
  } catch (error) {
    if (error instanceof DatasetValidationError) {
      issues.push(...error.issues);
      return;
    }

    throw error;
  }
}

function validateCountry(
  dataset: Record<string, unknown>,
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(dataset, "country")) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path: ["country"],
      message: "country is required.",
    });

    return;
  }

  const country = dataset.country;

  if (!isRecord(country)) {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: ["country"],
      message: "country must be an object.",
    });

    return;
  }

  readRequiredString(country, "code", ["country"], issues);
  readRequiredString(country, "name", ["country"], issues);
}

function validateSource(
  dataset: Record<string, unknown>,
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(dataset, "source")) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path: ["source"],
      message: "source is required.",
    });

    return;
  }

  const source = dataset.source;

  if (!isRecord(source)) {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: ["source"],
      message: "source must be an object.",
    });

    return;
  }

  readRequiredString(source, "id", ["source"], issues);
  readRequiredString(source, "name", ["source"], issues);

  validateOptionalString(source, "url", ["source"], issues);
  validateOptionalString(source, "retrievedAt", ["source"], issues);
}

function validateRegionLevel(
  region: Record<string, unknown>,
  path: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): void {
  const levelPath = [...path, "level"];

  if (!Object.hasOwn(region, "level")) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path: levelPath,
      message: "level is required.",
    });

    return;
  }

  const level = region.level;

  if (typeof level !== "number") {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: levelPath,
      message: "level must be a number.",
    });

    return;
  }

  if (!Number.isSafeInteger(level) || level < 0) {
    issues.push({
      code: "INVALID_FIELD_VALUE",
      path: levelPath,
      message: "level must be a non-negative safe integer.",
    });

    return;
  }
}

function validateParentId(
  region: Record<string, unknown>,
  path: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): void {
  const parentIdPath = [...path, "parentId"];

  if (!Object.hasOwn(region, "parentId")) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path: parentIdPath,
      message: "parentId is required.",
    });

    return;
  }

  const parentId = region.parentId;

  if (parentId === null) {
    return;
  }

  if (typeof parentId !== "string") {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: parentIdPath,
      message: "parentId must be a string or null.",
    });

    return;
  }

  if (parentId.trim().length === 0) {
    issues.push({
      code: "INVALID_FIELD_VALUE",
      path: parentIdPath,
      message: "parentId must not be empty.",
    });
  }
}

function validateAliases(
  region: Record<string, unknown>,
  path: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(region, "aliases")) {
    return;
  }

  const aliases = region.aliases;
  const aliasesPath = [...path, "aliases"];

  if (!Array.isArray(aliases)) {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: aliasesPath,
      message: "aliases must be an array.",
    });

    return;
  }

  aliases.forEach((alias, index) => {
    const aliasPath = [...aliasesPath, index];

    if (typeof alias !== "string") {
      issues.push({
        code: "INVALID_FIELD_TYPE",
        path: aliasPath,
        message: "Alias must be a string.",
      });

      return;
    }

    if (alias.trim().length === 0) {
      issues.push({
        code: "INVALID_FIELD_VALUE",
        path: aliasPath,
        message: "Alias must not be empty.",
      });
    }
  });
}

function validateAttributes(
  region: Record<string, unknown>,
  path: readonly (string | number)[],
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(region, "attributes")) {
    return;
  }

  if (!isRecord(region.attributes)) {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: [...path, "attributes"],
      message: "attributes must be an object.",
    });
  }
}

function validateRegion(
  region: Record<string, unknown>,
  index: number,
  issues: DatasetValidationIssue[],
): void {
  const path = ["regions", index] as const;

  readRequiredString(region, "id", path, issues);
  readRequiredString(region, "code", path, issues);
  readRequiredString(region, "name", path, issues);
  readRequiredString(region, "type", path, issues);

  validateRegionLevel(region, path, issues);
  validateParentId(region, path, issues);
  validateAliases(region, path, issues);
  validateAttributes(region, path, issues);
}

function validateRegions(
  dataset: Record<string, unknown>,
  issues: DatasetValidationIssue[],
): void {
  if (!Object.hasOwn(dataset, "regions")) {
    issues.push({
      code: "MISSING_REQUIRED_FIELD",
      path: ["regions"],
      message: "regions is required.",
    });

    return;
  }

  const regions = dataset.regions;

  if (!Array.isArray(regions)) {
    issues.push({
      code: "INVALID_FIELD_TYPE",
      path: ["regions"],
      message: "regions must be an array.",
    });

    return;
  }

  regions.forEach((region, index) => {
    if (!isRecord(region)) {
      issues.push({
        code: "INVALID_FIELD_TYPE",
        path: ["regions", index],
        message: "Region must be an object.",
      });

      return;
    }

    validateRegion(region, index, issues);
  });
}

export function validateDatasetStructure(input: unknown): RegionDataset {
  if (!isRecord(input)) {
    throw new DatasetValidationError([
      {
        code: "INVALID_DATASET",
        path: [],
        message: "Dataset must be an object.",
      },
    ]);
  }

  const issues: DatasetValidationIssue[] = [];

  validateSchemaVersion(input, issues);
  readRequiredString(input, "datasetVersion", [], issues);
  validateCountry(input, issues);
  validateSource(input, issues);
  readRequiredString(input, "generatedAt", [], issues);
  validateRegions(input, issues);

  if (issues.length > 0) {
    throw new DatasetValidationError(issues);
  }

  return input as unknown as RegionDataset;
}
