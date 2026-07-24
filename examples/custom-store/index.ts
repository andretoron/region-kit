import {
  MemoryRegionStore,
  RegionKit,
  type DatasetMetadata,
  type DescendantOptions,
  type FindByCodeOptions,
  type FindByNameOptions,
  type QueryOptions,
  type Region,
  type RegionDataset,
  type RegionFilter,
  type RegionPage,
  type RegionSearchPage,
  type RegionStore,
  type SearchOptions,
} from "region-kit";

class LoggingRegionStore implements RegionStore {
  readonly #delegate: RegionStore;
  #closePromise: Promise<void> | undefined;

  constructor(delegate: RegionStore) {
    this.#delegate = delegate;
  }

  getMetadata(): Promise<DatasetMetadata> {
    return this.#run("getMetadata", () => this.#delegate.getMetadata());
  }

  getById(id: string): Promise<Region | null> {
    return this.#run("getById", () => this.#delegate.getById(id));
  }

  findByCode(code: string, options?: FindByCodeOptions): Promise<RegionPage> {
    return this.#run("findByCode", () =>
      this.#delegate.findByCode(code, options),
    );
  }

  findByName(name: string, options?: FindByNameOptions): Promise<RegionPage> {
    return this.#run("findByName", () =>
      this.#delegate.findByName(name, options),
    );
  }

  search(query: string, options?: SearchOptions): Promise<RegionSearchPage> {
    return this.#run("search", () => this.#delegate.search(query, options));
  }

  filter(criteria: RegionFilter, options?: QueryOptions): Promise<RegionPage> {
    return this.#run("filter", () => this.#delegate.filter(criteria, options));
  }

  parentOf(id: string): Promise<Region | null> {
    return this.#run("parentOf", () => this.#delegate.parentOf(id));
  }

  childrenOf(id: string, options?: QueryOptions): Promise<RegionPage> {
    return this.#run("childrenOf", () =>
      this.#delegate.childrenOf(id, options),
    );
  }

  ancestorsOf(id: string): Promise<readonly Region[]> {
    return this.#run("ancestorsOf", () => this.#delegate.ancestorsOf(id));
  }

  descendantsOf(id: string, options?: DescendantOptions): Promise<RegionPage> {
    return this.#run("descendantsOf", () =>
      this.#delegate.descendantsOf(id, options),
    );
  }

  close(): Promise<void> {
    this.#closePromise ??= this.#run("close", () => this.#delegate.close());
    return this.#closePromise;
  }

  #run<T>(operation: string, callback: () => Promise<T>): Promise<T> {
    console.log(`[store] ${operation}`);
    return callback();
  }
}

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
    },
  ],
};

const store = new LoggingRegionStore(MemoryRegionStore.fromData(dataset));
const regions = await RegionKit.fromStore(store);

try {
  console.log(await regions.requireById("ID-JB"));
} finally {
  await regions.close();
}
