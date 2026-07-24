import { RegionKitError } from "./region-kit-error.js";

/** Stable category assigned to a dataset validation issue. */
export type DatasetValidationIssueCode =
  | "INVALID_DATASET"
  | "MISSING_REQUIRED_FIELD"
  | "INVALID_FIELD_TYPE"
  | "INVALID_FIELD_VALUE"
  | "UNSUPPORTED_SCHEMA_VERSION"
  | "DUPLICATE_REGION_ID"
  | "INVALID_ROOT_COUNT"
  | "INVALID_ROOT_REGION"
  | "MISSING_PARENT"
  | "UNKNOWN_PARENT"
  | "SELF_PARENT"
  | "INVALID_CHILD_LEVEL"
  | "HIERARCHY_CYCLE";

/** One property name or array index in a dataset validation path. */
export type DatasetValidationPathSegment = string | number;

/** Immutable path from the dataset root to an invalid value. */
export type DatasetValidationPath = readonly DatasetValidationPathSegment[];

/** One structural, compatibility, or hierarchy problem in a dataset. */
export interface DatasetValidationIssue {
  /** Stable category for programmatic issue handling. */
  readonly code: DatasetValidationIssueCode;
  /** Location of the invalid value, represented from the dataset root. */
  readonly path: DatasetValidationPath;
  /** Human-readable explanation of the problem. */
  readonly message: string;
}

/** Indicates that a value does not satisfy the Region-Kit Dataset Contract. */
export class DatasetValidationError extends RegionKitError {
  /** Stable error code for dataset validation failures. */
  readonly code = "DATASET_INVALID" as const;
  /** Immutable validation issues collected before the dataset was rejected. */
  readonly issues: readonly DatasetValidationIssue[];

  /**
   * Creates a validation error from one or more issues.
   *
   * @param issues - Non-empty collection of validation issues.
   * @throws {TypeError} When `issues` is empty.
   */
  constructor(issues: readonly DatasetValidationIssue[]) {
    if (issues.length === 0) {
      throw new TypeError(
        "DatasetValidationError requires at least one (1) validation issue.",
      );
    }

    super(createDatasetValidationMessage(issues));

    this.issues = Object.freeze(
      issues.map((issue) =>
        Object.freeze({
          ...issue,
          path: Object.freeze([...issue.path]),
        }),
      ),
    );
  }
}

function createDatasetValidationMessage(
  issues: readonly DatasetValidationIssue[],
): string {
  const firstIssue = issues[0];

  if (issues.length === 1 && firstIssue !== undefined) {
    return `Dataset validation failed: ${firstIssue.message}`;
  }

  return `Dataset validation failed with ${issues.length} issues.`;
}

export function formatDatasetValidationPath(
  path: DatasetValidationPath,
): string {
  if (path.length === 0) {
    return "$";
  }

  return path.reduce<string>((result, segment) => {
    if (typeof segment === "number") {
      return `${result}[${segment}]`;
    }

    return `${result}.${segment}`;
  }, "$");
}
