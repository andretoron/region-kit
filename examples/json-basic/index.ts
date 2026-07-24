import { RegionKit } from "region-kit";
import { resolve } from "node:path";

const regions = await RegionKit.fromFile(
  resolve(import.meta.dirname, "..", "regions.json"),
);

try {
  const province = await regions.requireById("ID-JB");
  const children = await regions.childrenOf(province.id, {
    sortBy: "name",
  });

  console.log(`${province.name} has ${children.page.total} direct children:`);

  for (const child of children.items) {
    console.log(`- ${child.name} (${child.type})`);
  }
} finally {
  await regions.close();
}
