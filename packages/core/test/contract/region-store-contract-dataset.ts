import type {
  DatasetMetadata,
  RegionDataset,
} from "../../src/dataset/index.js";

export const regionStoreContractDataset = {
  schemaVersion: "1.0.0",
  datasetVersion: "2026.7.0",
  country: {
    code: "ID",
    name: "Indonesia",
  },
  source: {
    id: "contract-test",
    name: "RegionStore Contract Test",
  },
  generatedAt: "2026-07-20T00:00:00.000Z",
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
      aliases: ["West Java"],
    },
    {
      id: "ID-JB-CITY-BDG",
      code: "3273",
      name: "Kota Bandung",
      level: 2,
      type: "city",
      parentId: "ID-JB",
      aliases: ["Bandung"],
      attributes: {
        category: "urban",
      },
    },
    {
      id: "ID-JB-REG-BDG",
      code: "3204",
      name: "Kabupaten Bandung",
      level: 2,
      type: "regency",
      parentId: "ID-JB",
      aliases: ["Bandung"],
    },
    {
      id: "ID-JB-CITY-BDG-DISTRICT",
      code: "01",
      name: "Andir",
      level: 3,
      type: "district",
      parentId: "ID-JB-CITY-BDG",
    },
    {
      id: "ID-JB-REG-BDG-DISTRICT",
      code: "01",
      name: "Cileunyi",
      level: 3,
      type: "district",
      parentId: "ID-JB-REG-BDG",
    },
  ],
} as const satisfies RegionDataset;

export const regionStoreContractMetadata = {
  schemaVersion: "1.0.0",
  datasetVersion: "2026.7.0",
  country: {
    code: "ID",
    name: "Indonesia",
  },
  source: {
    id: "contract-test",
    name: "RegionStore Contract Test",
  },
  generatedAt: "2026-07-20T00:00:00.000Z",
} as const satisfies DatasetMetadata;
