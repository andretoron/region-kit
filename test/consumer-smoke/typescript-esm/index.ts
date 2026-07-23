import {
  DatasetValidationError,
  RegionKit,
  type Region,
  type RegionDataset,
  type RegionSearchPage,
  type RegionStore,
} from "region-kit";

const dataset = {
  schemaVersion: "1.0.0",
  datasetVersion: "2026.1.0",
  country: {
    code: "ID",
    name: "Indonesia",
  },
  source: {
    id: "typescript-consumer-smoke",
    name: "TypeScript Consumer Smoke Test",
  },
  generatedAt: "2026-07-23T00:00:00.000Z",
  regions: [
    {
      id: "ID",
      code: "ID",
      name: "Indonesia",
      level: 0,
      type: "country",
      parentId: null,
    },
    {
      id: "ID-JB",
      code: "32",
      name: "Jawa Barat",
      level: 1,
      type: "province",
      parentId: "ID",
    },
    {
      id: "ID-JB-BDG",
      code: "3273",
      name: "Kota Bandung",
      level: 2,
      type: "city",
      parentId: "ID-JB",
      aliases: ["Bandung"],
    },
  ],
} satisfies RegionDataset;

const regions: RegionKit = await RegionKit.fromData(dataset);

const region: Region | null = await regions.getById("ID-JB");

const searchResult: RegionSearchPage = await regions.search("Bandung", {
  match: "exact",
});

const store: RegionStore = regions;

const validationError: DatasetValidationError = new DatasetValidationError([
  {
    code: "INVALID_DATASET",
    path: [],
    message: "TypeScript consumer validation error.",
  },
]);

void region;
void searchResult;
void store;
void validationError;

await regions.close();
