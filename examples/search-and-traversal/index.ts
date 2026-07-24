import { RegionKit, type RegionDataset } from "region-kit";

const dataset: RegionDataset = {
  schemaVersion: "1.0.0",
  datasetVersion: "example-1",
  country: { code: "ID", name: "Indonesia" },
  source: { id: "example", name: "Region Kit example" },
  generatedAt: "2026-07-24T00:00:00.000Z",
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
      id: "ID-JB-BDG",
      code: "3273",
      name: "Kota Bandung",
      level: 2,
      type: "city",
      parentId: "ID-JB",
      aliases: ["Bandung"],
    },
    {
      id: "ID-JB-BDG-COBLONG",
      code: "3273030",
      name: "Coblong",
      level: 3,
      type: "district",
      parentId: "ID-JB-BDG",
    },
  ],
};

const regions = await RegionKit.fromData(dataset);

try {
  const search = await regions.search("band", {
    match: "prefix",
    sortBy: "name",
  });

  console.log("Search matches:");
  for (const item of search.items) {
    console.log(
      `- ${item.region.name}: ${item.matchedField}=${item.matchedValue}`,
    );
  }

  const ancestors = await regions.ancestorsOf("ID-JB-BDG-COBLONG");
  console.log("Ancestor path:", ancestors.map(({ name }) => name).join(" -> "));

  const descendants = await regions.descendantsOf("ID-JB", {
    maxDepth: 2,
    sortBy: "level",
  });
  console.log(
    "Descendants:",
    descendants.items.map(({ name }) => name).join(", "),
  );
} finally {
  await regions.close();
}
