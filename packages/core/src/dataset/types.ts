export interface Region {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly level: number;
  readonly type: string;
  readonly parentId: string | null;
  readonly aliases?: readonly string[];
  readonly attributes?: Readonly<Record<string, unknown>>;
}

export interface DatasetCountry {
  readonly code: string;
  readonly name: string;
}

export interface DatasetSource {
  readonly id: string;
  readonly name: string;
  readonly url?: string;
  readonly retrievedAt?: string;
}

export interface RegionDataset {
  readonly schemaVersion: string;
  readonly datasetVersion: string;
  readonly country: DatasetCountry;
  readonly source: DatasetSource;
  readonly generatedAt: string;
  readonly regions: readonly Region[];
}
