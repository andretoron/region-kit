import { readFile } from "node:fs/promises";
import { DatasetLoadError } from "../errors/dataset-load-error.js";

interface ResolvedDatasetFileSource {
  readonly path: string | URL;
  readonly displayName: string;
}

export async function loadRegionDatasetFile(
  source: string | URL,
): Promise<unknown> {
  const resolved = resolveDatasetFileSource(source);

  let contents: string;

  try {
    contents = await readFile(resolved.path, "utf8");
  } catch (cause) {
    throw new DatasetLoadError(resolved.displayName, "read", cause);
  }

  try {
    return JSON.parse(contents) as unknown;
  } catch (cause) {
    throw new DatasetLoadError(resolved.displayName, "parse", cause);
  }
}

function resolveDatasetFileSource(source: unknown): ResolvedDatasetFileSource {
  if (typeof source === "string") {
    if (source.trim().length === 0) {
      throw new TypeError(
        "RegionKit.fromFile() requires a non-empty file path.",
      );
    }

    return Object.freeze({
      path: source,
      displayName: source,
    });
  }

  if (source instanceof URL) {
    if (source.protocol !== "file:") {
      throw new TypeError(
        'RegionKit.fromFile() only supports URLs using the "file:" protocol.',
      );
    }

    const snapshot = new URL(source.href);

    return Object.freeze({
      path: snapshot,
      displayName: snapshot.href,
    });
  }

  throw new TypeError(
    "RegionKit.fromFile() requires a file path string or file URL.",
  );
}
