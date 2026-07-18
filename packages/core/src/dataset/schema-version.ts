import { DatasetValidationError } from "../errors/index.js";

const DATASET_SCHEMA_VERSION_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export const SUPPORTED_DATASET_SCHEMA_MAJOR = 1;

export interface DatasetSchemaVersion {
  readonly raw: string;
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

export function parseDatasetSchemaVersion(value: string): DatasetSchemaVersion {
  const match = DATASET_SCHEMA_VERSION_PATTERN.exec(value);

  if (match === null) {
    throw new TypeError(
      `Invalid dataset schema version "${value}". Expected MAJOR.MINOR.PATCH.`,
    );
  }

  const major = parseVersionComponent(match[1], value);
  const minor = parseVersionComponent(match[2], value);
  const patch = parseVersionComponent(match[3], value);

  return Object.freeze({
    raw: value,
    major,
    minor,
    patch,
  });
}

function parseVersionComponent(
  value: string | undefined,
  version: string,
): number {
  if (value === undefined) {
    throw new TypeError(`Invalid dataset schema version "${version}".`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new TypeError(
      `Invalid dataset schema version "${version}". Version components must be safe integers.`,
    );
  }

  return parsed;
}

export function isSupportedDatasetSchemaVersion(value: string): boolean {
  try {
    return (
      parseDatasetSchemaVersion(value).major === SUPPORTED_DATASET_SCHEMA_MAJOR
    );
  } catch {
    return false;
  }
}

export function assertSupportedDatasetSchemaVersion(
  value: string,
): DatasetSchemaVersion {
  let version: DatasetSchemaVersion;

  try {
    version = parseDatasetSchemaVersion(value);
  } catch {
    throw new DatasetValidationError([
      {
        code: "INVALID_FIELD_VALUE",
        path: ["schemaVersion"],
        message: `schemaVersion must use the "MAJOR.MINOR.PATCH" format.`,
      },
    ]);
  }

  if (version.major !== SUPPORTED_DATASET_SCHEMA_MAJOR) {
    throw new DatasetValidationError([
      {
        code: "UNSUPPORTED_SCHEMA_VERSION",
        path: ["schemaVersion"],
        message:
          `Unsupported dataset schema major version ${version.major}. ` +
          `Supported major version is ${SUPPORTED_DATASET_SCHEMA_MAJOR}.`,
      },
    ]);
  }

  return version;
}
