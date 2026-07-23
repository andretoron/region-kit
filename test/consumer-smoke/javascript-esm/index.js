import assert from "node:assert/strict";

import { RegionKit, RegionKitClosedError } from "region-kit";

const dataset = {
  schemaVersion: "1.0.0",
  datasetVersion: "2026.1.0",
  country: {
    code: "ID",
    name: "Indonesia",
  },
  source: {
    id: "consumer-smoke",
    name: "Consumer Smoke Test",
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
      aliases: ["Jabar"],
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
    {
      id: "ID-JB-BKS",
      code: "3275",
      name: "Kota Bekasi",
      level: 2,
      type: "city",
      parentId: "ID-JB",
    },
  ],
};

const regions = await RegionKit.fromData(dataset);

try {
  const province = await regions.getById("ID-JB");

  assert.ok(province);
  assert.equal(province.id, "ID-JB");
  assert.equal(province.name, "Jawa Barat");

  const searchResult = await regions.search("Bandung", {
    match: "exact",
  });

  assert.deepEqual(
    searchResult.items.map(({ region, matchedField }) => ({
      id: region.id,
      matchedField,
    })),
    [
      {
        id: "ID-JB-BDG",
        matchedField: "alias",
      },
    ],
  );

  const children = await regions.childrenOf("ID-JB");

  assert.deepEqual(
    children.items.map((region) => region.id),
    ["ID-JB-BDG", "ID-JB-BKS"],
  );
} finally {
  await regions.close();
}

await assert.rejects(
  () => regions.getById("ID"),
  (error) => {
    assert.ok(error instanceof RegionKitClosedError);
    return true;
  },
);

await assert.rejects(
  () => import("region-kit/store/memory-indexes.js"),
  (error) => {
    assert.equal(error.code, "ERR_PACKAGE_PATH_NOT_EXPORTED");
    return true;
  },
);

console.log("Javascript ESM consumer smoke test passed.");
