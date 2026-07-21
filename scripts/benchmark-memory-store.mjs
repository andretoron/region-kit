import { mkdir, writeFile } from "node:fs/promises";
import { arch, cpus, platform, totalmem } from "node:os";
import { dirname, resolve } from "node:path";
import { performance } from "node:perf_hooks";

import {
  MemoryRegionStore,
  validateRegionDataset,
} from "../packages/core/dist/index.js";

import { buildMemoryIndexes } from "../packages/core/dist/store/memory-indexes.js";

const REGION_COUNT = 10_000;
const TIMING_ITERATIONS = 10;
const WARMUP_ITERATIONS = 3;
const MEMORY_ITERATIONS = 5;

function createBenchmarkDataset(regionCount) {
  if (!Number.isInteger(regionCount) || regionCount < 2) {
    throw new Error("regionCount must be an integer greater than one");
  }

  const regions = [
    {
      id: "ID",
      code: "ID",
      name: "Indonesia",
      level: 0,
      type: "country",
      parentId: null,
    },
  ];

  for (let sequence = 1; sequence < regionCount; sequence += 1) {
    regions.push({
      id: `ID-${sequence}`,
      code: String(sequence),
      name: `Benchmark Region ${sequence}`,
      level: 1,
      type: sequence % 2 === 0 ? "city" : "regency",
      parentId: "ID",
      aliases: [`Benchmark Area ${sequence}`],
      attributes: {
        sequence,
      },
    });
  }

  return {
    schemaVersion: "1.0.0",
    datasetVersion: "1.0.0",
    country: {
      code: "ID",
      name: "Indonesia",
    },
    source: {
      id: "synthetic-benchmark",
      name: "Synthetic Memory Store Benchmark",
    },
    generatedAt: "2026-07-21T00:00:00.000Z",
    regions,
  };
}

function forceGarbageCollection() {
  if (typeof globalThis.gc !== "function") {
    throw new Error(
      "Garbage collection is unavailable. Run Node.js with --expose-gc",
    );
  }

  globalThis.gc();
}

function consume(value) {
  if (value === undefined) {
    throw new Error("Benchmark operation unexpectedly returned undefined");
  }
}

function runTimedOperation(operation) {
  const startedAt = performance.now();
  const result = operation();
  const duration = performance.now() - startedAt;

  consume(result);

  return duration;
}

function collectTimings(operation) {
  for (let iteration = 0; iteration < WARMUP_ITERATIONS; iteration += 1) {
    consume(operation());
  }

  const samples = [];

  for (let iteration = 0; iteration < TIMING_ITERATIONS; iteration += 1) {
    forceGarbageCollection();
    samples.push(runTimedOperation(operation));
  }

  return samples;
}

function measureRetainedHeap(operation) {
  forceGarbageCollection();

  const before = process.memoryUsage().heapUsed;
  const retained = operation();

  forceGarbageCollection();

  const after = process.memoryUsage().heapUsed;

  consume(retained);

  return after - before;
}

function summarize(samples) {
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

const dataset = createBenchmarkDataset(REGION_COUNT);
const serializedDataset = JSON.stringify(dataset);

const validationTimings = collectTimings(() => validateRegionDataset(dataset));

const indexTimings = collectTimings(() => buildMemoryIndexes(dataset.regions));

const initializationTimings = collectTimings(() =>
  MemoryRegionStore.fromData(dataset),
);

const memorySamples = Array.from({ length: MEMORY_ITERATIONS }, () =>
  measureRetainedHeap(() => MemoryRegionStore.fromData(dataset)),
);

const memoryBytes = summarize(memorySamples);

const report = {
  benchmark: "memory-store-milestone-2",
  informational: true,
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: platform(),
    architecture: arch(),
    cpu: cpus()[0]?.model ?? "unknown",
    logicalCpuCount: cpus().length,
    totalSystemMemoryMiB: bytesToMiB(totalmem()),
  },
  dataset: {
    kind: "synthetic-flat-hierarchy",
    regionCount: dataset.regions.length,
    serializedBytes: Buffer.byteLength(serializedDataset),
    serializedMiB: bytesToMiB(Buffer.byteLength(serializedDataset)),
  },
  configuration: {
    warmupIterations: WARMUP_ITERATIONS,
    timingIterations: TIMING_ITERATIONS,
    memoryIterations: MEMORY_ITERATIONS,
  },
  timingsMilliseconds: {
    validation: summarize(validationTimings),
    indexConstruction: summarize(indexTimings),
    storeInitialization: summarize(initializationTimings),
  },
  retainedHeapDelta: {
    bytes: memoryBytes,
    mebibytes: {
      minimum: bytesToMiB(memoryBytes.minimum),
      median: bytesToMiB(memoryBytes.median),
      maximum: bytesToMiB(memoryBytes.maximum),
    },
  },
  notes: [
    "Store initialization includes validation, snapshot cloning, metadata projection, and index construction.",
    "Retained heap measurements are process-level estimates and can vary between runs.",
    "This synthetic dataset is not a replacement for a future benchmark using a locked production dataset.",
  ],
};

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
