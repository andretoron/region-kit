import type { RegionDataset } from "./types.js";
import { validateDatasetHierarchy } from "./validate-dataset-hierarchy.js";
import { validateDatasetStructure } from "./validate-dataset-structure.js";

/**
 * Validates an unknown value as a Region-Kit dataset.
 *
 * Structural validation is performed before hierarchy validation.
 *
 * @param input - The value to validate.
 * @returns The original input narrowed to a valid region dataset.
 * @throws {DatasetValidationError} When dataset validation fails.
 */
export function validateRegionDataset(input: unknown): RegionDataset {
  const dataset = validateDatasetStructure(input);

  return validateDatasetHierarchy(dataset);
}
