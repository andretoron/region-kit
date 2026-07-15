export type DatasetValidationCode =
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

export type DatasetValidationPathSegment = string | number;

export type DatasetValidationPath = readonly DatasetValidationPathSegment[];

export interface DatasetValidationIssue {
  readonly code: DatasetValidationCode;
  readonly path: DatasetValidationPath;
  readonly message: string;
}

export class DatasetValidationError extends Error {
  readonly code = "DATASET_VALIDATION_ERROR";
  readonly issues: readonly DatasetValidationIssue[];

  constructor(issues: readonly DatasetValidationIssue[]) {
    if (issues.length === 0) {
      throw new TypeError(
        "DatasetValidationError requires at least one (1) validation issue.",
      );
    }

    super(createDatasetValidationMessage(issues));

    this.name = "DatasetValidationError";
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
