import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { arch, cpus, platform, release, tmpdir, totalmem } from "node:os";
import { dirname, join, resolve } from "node:path";
import { performance } from "node:perf_hooks";

import { RegionKit } from "../packages/core/dist/index.js";

const BRANCHING_FACTOR = 10;
const HIERARCHY_DEPTH = 4;
const TIMING_ITERATIONS = 10;
const WARMUP_ITERATIONS = 3;
const PAGINATION_LIMIT = 100;
const PAGINATION_OFFSET = 5_000;

function createBenchmarkDataset() {
  const root = {
    id: "ID",
    code: "ID",
    name: "Indonesia",
    level: 0,
    type: "country",
    parentId: null,
  };
  const regions = [root];
  const regionsByLevel = [[root]];

  let sequence = 1;

  for (let level = 1; level <= HIERARCHY_DEPTH; level += 1) {
    const currentLevel = [];

    for (const parent of regionsByLevel[level - 1]) {
      for (let child = 0; child < BRANCHING_FACTOR; child += 1) {
        const paddedSequence = String(sequence).padStart(5, "0");
        const region = {
          id: `ID-R${paddedSequence}`,
          code: paddedSequence,
          name: `Benchmark Region ${paddedSequence}`,
          level,
          type: resolveRegionType(level, child),
          parentId: parent.id,
          aliases: [`Benchmark Area ${paddedSequence}`],
          attributes: {
            sequence,
          },
        };

        regions.push(region);
        currentLevel.push(region);
        sequence += 1;
      }
    }

    regionsByLevel.push(currentLevel);
  }

  const firstLevelRegion = regionsByLevel[1]?.[0];
  const codeLookupRegion = regionsByLevel[3]?.[123];
  const exactNameRegion = regionsByLevel[2]?.[42];
  const leafRegion = regionsByLevel[HIERARCHY_DEPTH]?.[0];
  const childrenParent = regionsByLevel[HIERARCHY_DEPTH - 1]?.[0];

  assert.ok(firstLevelRegion);
  assert.ok(codeLookupRegion);
  assert.ok(exactNameRegion);
  assert.ok(leafRegion);
  assert.ok(childrenParent);

  return {
    dataset: {
      schemaVersion: "1.0.0",
      datasetVersion: "1.0.0",
      country: {
        code: "ID",
        name: "Indonesia",
      },
      source: {
        id: "synthetic-public-api-benchmark",
        name: "Synthetic Public API Benchmark",
      },
      generatedAt: "2026-07-23T00:00:00.000Z",
      regions,
    },
    targets: {
      firstLevelRegion,
      codeLookupRegion,
      exactNameRegion,
      leafRegion,
      childrenParent,
    },
  };
}

function resolveRegionType(level, child) {
  if (level === 1) {
    return "province";
  }

  if (level === 2) {
    return child % 2 === 0 ? "regency" : "city";
  }

  if (level === 3) {
    return "district";
  }

  return "village";
}

function consume(value) {
  if (value === undefined) {
    throw new Error("Benchmark operation unexpectedly returned undefined");
  }
}

async function runTimedOperation(operation) {
  const startedAt = performance.now();
  const result = await operation();
  const duration = performance.now() - startedAt;

  consume(result);

  return { duration, result };
}

async function collectTimings(operation, afterEach = async () => {}) {
  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration += 1) {
    const result = await operation();
    consume(result);
    await afterEach(result);
  }

  const samples = [];

  for (let iteration = 0; iteration < TIMING_ITERATIONS; iteration += 1) {
    const { duration, result } = await runTimedOperation(operation);
    samples.push(duration);
    await afterEach(result);
  }

  return samples;
}

async function collectCloseTimings(dataset) {
  const samples = [];

  for (
    let iteration = 0;
    iteration < WARMUP_ITERATIONS + TIMING_ITERATIONS;
    iteration += 1
  ) {
    const regions = await RegionKit.fromData(dataset);
    const startedAt = performance.now();
    await regions.close();
    const duration = performance.now() - startedAt;

    if (iteration >= WARMUP_ITERATIONS) {
      samples.push(duration);
    }
  }

  return samples;
}

function summarize(samples) {
  if (samples.length === 0) {
    throw new Error("Cannot summarize an empty benchmark sample");
  }

  const sorted = [...samples].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return {
    minimum: Number(sorted[0].toFixed(3)),
    median: Number(median.toFixed(3)),
    maximum: Number(sorted.at(-1).toFixed(3)),
  };
}

function bytesToMiB(bytes) {
  return Number((bytes / 1024 / 1024).toFixed(3));
}

async function verifyOperations(operations, expected) {
  assert.equal((await operations.getById())?.id, expected.leafRegionId);
  assert.equal(
    (await operations.findByCode()).items[0]?.id,
    expected.codeLookupRegionId,
  );
  assert.equal(
    (await operations.exactNameSearch()).items[0]?.region.id,
    expected.exactNameRegionId,
  );
  assert.ok((await operations.prefixSearch()).page.total > 1);
  assert.ok((await operations.containsSearch()).page.total > 1_000);
  assert.equal((await operations.filter()).page.total, 100);
  assert.equal((await operations.childrenOf()).page.total, BRANCHING_FACTOR);
  assert.equal((await operations.ancestorsOf()).length, HIERARCHY_DEPTH);
  assert.equal((await operations.descendantsOf()).page.total, 1_110);

  const pagination = await operations.largeResultPagination();
  assert.equal(pagination.items.length, PAGINATION_LIMIT);
  assert.equal(pagination.page.offset, PAGINATION_OFFSET);
  assert.equal(pagination.page.total, 10_000);
}

const { dataset, targets } = createBenchmarkDataset();
const serializedDataset = JSON.stringify(dataset);
const benchmarkTemporaryDirectory = await mkdtemp(
  join(tmpdir(), "region-kit-public-api-benchmark-"),
);
const datasetPath = join(benchmarkTemporaryDirectory, "regions.json");

let report;

try {
  await writeFile(datasetPath, `${serializedDataset}\n`, "utf8");

  const fromDataTimings = await collectTimings(
    () => RegionKit.fromData(dataset),
    (regions) => regions.close(),
  );
  const fromFileTimings = await collectTimings(
    () => RegionKit.fromFile(datasetPath),
    (regions) => regions.close(),
  );

  const regions = await RegionKit.fromData(dataset);

  try {
    const operations = {
      getById: () => regions.getById(targets.leafRegion.id),
      findByCode: () => regions.findByCode(targets.codeLookupRegion.code),
      exactNameSearch: () =>
        regions.search(targets.exactNameRegion.name, { match: "exact" }),
      prefixSearch: () =>
        regions.search("Benchmark Region 000", { match: "prefix" }),
      containsSearch: () => regions.search("Region 0", { match: "contains" }),
      filter: () => regions.filter({ levels: [2] }),
      childrenOf: () => regions.childrenOf(targets.childrenParent.id),
      ancestorsOf: () => regions.ancestorsOf(targets.leafRegion.id),
      descendantsOf: () =>
        regions.descendantsOf(targets.firstLevelRegion.id, { limit: 1_000 }),
      largeResultPagination: () =>
        regions.filter(
          { types: ["village"] },
          {
            limit: PAGINATION_LIMIT,
            offset: PAGINATION_OFFSET,
            sortBy: "code",
          },
        ),
    };

    await verifyOperations(operations, {
      leafRegionId: targets.leafRegion.id,
      codeLookupRegionId: targets.codeLookupRegion.id,
      exactNameRegionId: targets.exactNameRegion.id,
    });

    const timings = {
      getById: summarize(await collectTimings(operations.getById)),
      findByCode: summarize(await collectTimings(operations.findByCode)),
      exactNameSearch: summarize(
        await collectTimings(operations.exactNameSearch),
      ),
      prefixSearch: summarize(await collectTimings(operations.prefixSearch)),
      containsSearch: summarize(
        await collectTimings(operations.containsSearch),
      ),
      filter: summarize(await collectTimings(operations.filter)),
      childrenOf: summarize(await collectTimings(operations.childrenOf)),
      ancestorsOf: summarize(await collectTimings(operations.ancestorsOf)),
      descendantsOf: summarize(await collectTimings(operations.descendantsOf)),
      largeResultPagination: summarize(
        await collectTimings(operations.largeResultPagination),
      ),
    };

    report = {
      benchmark: "public-api-milestone-4",
      informational: true,
      generatedAt: new Date().toISOString(),
      environment: {
        node: process.version,
        platform: platform(),
        release: release(),
        architecture: arch(),
        cpu: cpus()[0]?.model ?? "unknown",
        logicalCpuCount: cpus().length,
        totalSystemMemoryMiB: bytesToMiB(totalmem()),
      },
      dataset: {
        kind: "synthetic-balanced-tree",
        regionCount: dataset.regions.length,
        branchingFactor: BRANCHING_FACTOR,
        hierarchyDepth: HIERARCHY_DEPTH,
        leafRegionCount: BRANCHING_FACTOR ** HIERARCHY_DEPTH,
        serializedBytes: Buffer.byteLength(serializedDataset),
        serializedMiB: bytesToMiB(Buffer.byteLength(serializedDataset)),
      },
      configuration: {
        warmupIterations: WARMUP_ITERATIONS,
        timingIterations: TIMING_ITERATIONS,
        paginationLimit: PAGINATION_LIMIT,
        paginationOffset: PAGINATION_OFFSET,
      },
      timingsMilliseconds: {
        initialization: {
          fromData: summarize(fromDataTimings),
          fromFile: summarize(fromFileTimings),
        },
        lookup: {
          getById: timings.getById,
          findByCode: timings.findByCode,
        },
        search: {
          exactName: timings.exactNameSearch,
          prefix: timings.prefixSearch,
          contains: timings.containsSearch,
        },
        filtering: {
          filter: timings.filter,
          largeResultPagination: timings.largeResultPagination,
        },
        traversal: {
          childrenOf: timings.childrenOf,
          ancestorsOf: timings.ancestorsOf,
          descendantsOf: timings.descendantsOf,
        },
        lifecycle: {
          close: summarize(await collectCloseTimings(dataset)),
        },
      },
      notes: [
        "All measured library operations use the public region-kit package entry point.",
        "fromFile includes file reading, JSON parsing, validation, snapshot creation, and index construction; temporary file creation is excluded.",
        "Initialization timings exclude close(), while close timings exclude initialization.",
        "Results are informational and can vary with runtime, hardware, operating system, and background activity.",
        "The deterministic synthetic hierarchy is not a replacement for a future benchmark using a locked production dataset.",
      ],
    };
  } finally {
    await regions.close();
  }
} finally {
  await rm(benchmarkTemporaryDirectory, { recursive: true, force: true });
}

const serializedReport = `${JSON.stringify(report, null, 2)}\n`;
const outputArgument = process.argv.find((argument) =>
  argument.startsWith("--output="),
);

if (outputArgument !== undefined) {
  const outputPath = resolve(outputArgument.slice("--output=".length));

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serializedReport, "utf8");
}

process.stdout.write(serializedReport);
