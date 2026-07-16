export type {
  DatasetCountry,
  DatasetSource,
  Region,
  RegionDataset,
} from "./dataset/index.js";

export { RegionKitError } from "./errors/index.js";
export type { RegionKitErrorCode } from "./errors/index.js";

export {
  DatasetValidationError,
  formatDatasetValidationPath,
} from "./errors/index.js";

export type {
  DatasetValidationIssue,
  DatasetValidationIssueCode,
  DatasetValidationPath,
  DatasetValidationPathSegment,
} from "./errors/index.js";

export type { DatasetSchemaVersion } from "./dataset/index.js";

export {
  SUPPORTED_DATASET_SCHEMA_MAJOR,
  assertSupportedDatasetSchemaVersion,
  isSupportedDatasetSchemaVersion,
  parseDatasetSchemaVersion,
} from "./dataset/index.js";
