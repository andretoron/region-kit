/** A single administrative region in a validated dataset. */
export interface Region {
  /** Stable identifier that is unique within the dataset. */
  readonly id: string;
  /** Source-defined region code; codes are not required to be globally unique. */
  readonly code: string;
  /** Primary display name. */
  readonly name: string;
  /** Zero-based hierarchy level, where the single root region is level zero. */
  readonly level: number;
  /** Dataset-defined administrative type, such as `province` or `city`. */
  readonly type: string;
  /** Parent region identifier, or `null` for the root region. */
  readonly parentId: string | null;
  /** Alternative names used by name lookup and search. */
  readonly aliases?: readonly string[];
  /** Dataset-specific values that are not interpreted by region-kit. */
  readonly attributes?: Readonly<Record<string, unknown>>;
}

/** Country represented by a region dataset. */
export interface DatasetCountry {
  /** Dataset-defined country code, normally an ISO country code. */
  readonly code: string;
  /** Human-readable country name. */
  readonly name: string;
}

/** Provenance of a region dataset. */
export interface DatasetSource {
  /** Stable identifier for the source. */
  readonly id: string;
  /** Human-readable source name. */
  readonly name: string;
  /** Public source URL, when available. */
  readonly url?: string;
  /** ISO 8601 timestamp recording when the source data was retrieved. */
  readonly retrievedAt?: string;
}

/** Version and provenance metadata for a region dataset. */
export interface DatasetMetadata {
  /** Dataset-contract version. The MVP accepts compatible `1.x.x` versions. */
  readonly schemaVersion: string;
  /** Publisher-assigned version of the dataset contents. */
  readonly datasetVersion: string;
  /** Country represented by the dataset. */
  readonly country: DatasetCountry;
  /** Source from which the dataset was produced. */
  readonly source: DatasetSource;
  /** ISO 8601 timestamp recording when the dataset was generated. */
  readonly generatedAt: string;
}

/** Complete input accepted by region-kit after validation. */
export interface RegionDataset extends DatasetMetadata {
  /** Regions forming one valid, connected hierarchy with a single root. */
  readonly regions: readonly Region[];
}
