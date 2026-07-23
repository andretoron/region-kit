import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const coreDirectory = join(repositoryRoot, "packages", "core");
const temporaryDirectory = mkdtempSync(
  join(tmpdir(), "region-kit-distribution-"),
);

const requiredFiles = [
  "LICENSE",
  "README.md",
  "package.json",
  "dist/index.js",
  "dist/index.js.map",
  "dist/index.d.ts",
  "dist/index.d.ts.map",
];

const allowedTopLevelEntries = new Set([
  "LICENSE",
  "README.md",
  "package.json",
  "dist",
]);

const forbiddenPathPatterns = [
  /(^|\/)src(\/|$)/i,
  /(^|\/)(test|tests)(\/|$)/i,
  /(^|\/)fixtures?(\/|$)/i,
  /(^|\/)coverage(\/|$)/i,
  /(^|\/)node_modules(\/|$)/i,
  /(^|\/)docs(\/|$)/i,
  /(^|\/)\.github(\/|$)/i,
  /(^|\/)\.changeset(\/|$)/i,
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)[^/]+\.(?:test|spec)\.[^/]+$/i,
  /(^|\/)[^/]+\.(?:db|dump|pem|sqlite|sqlite3|sql)$/i,
];

const javascriptConsumerFixtureDirectory = join(
  repositoryRoot,
  "test",
  "consumer-smoke",
  "javascript-esm",
);

function runPnpm(arguments_, options = {}) {
  const pnpmCliPath = process.env.npm_execpath;

  if (pnpmCliPath) {
    return execFileSync(process.execPath, [pnpmCliPath, ...arguments_], {
      cwd: repositoryRoot,
      ...options,
    });
  }

  return execFileSync("pnpm", arguments_, {
    cwd: repositoryRoot,
    shell: process.platform === "win32",
    ...options,
  });
}

function normalizePackagePath(path) {
  return path.replaceAll("\\", "/").replace(/^package\//, "");
}

function auditPackageFiles(files) {
  const packagePaths = files.map(({ path }) => normalizePackagePath(path));
  const packagePathSet = new Set(packagePaths);

  const missingFiles = requiredFiles.filter(
    (path) => !packagePathSet.has(path),
  );
  if (missingFiles.length > 0) {
    throw new Error(
      `Packed tarball is missing required files:\n${missingFiles
        .map((path) => `- ${path}`)
        .join("\n")}`,
    );
  }

  const unexpectedFiles = packagePaths.filter((path) => {
    const [topLevelEntry] = path.split("/");
    return !allowedTopLevelEntries.has(topLevelEntry);
  });
  if (unexpectedFiles.length > 0) {
    throw new Error(
      `Packed tarball contains unexpected top-level files:\n${unexpectedFiles
        .map((path) => `- ${path}`)
        .join("\n")}`,
    );
  }

  const forbiddenFiles = packagePaths.filter((path) =>
    forbiddenPathPatterns.some((pattern) => pattern.test(path)),
  );
  if (forbiddenFiles.length > 0) {
    throw new Error(
      `Packed tarball contains forbidden files:\n${forbiddenFiles
        .map((path) => `- ${path}`)
        .join("\n")}`,
    );
  }

  for (const extension of [".js", ".js.map", ".d.ts", ".d.ts.map"]) {
    if (
      !packagePaths.some(
        (path) => path.startsWith("dist/") && path.endsWith(extension),
      )
    ) {
      throw new Error(
        `Packed tarball contains no dist file ending in ${extension}`,
      );
    }
  }

  return packagePaths;
}

function findFiles(directory, predicate) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return findFiles(path, predicate);
    }

    return predicate(path) ? [path] : [];
  });
}

function auditSourceMaps() {
  const sourceMapPaths = findFiles(join(coreDirectory, "dist"), (path) =>
    path.endsWith(".map"),
  );

  for (const sourceMapPath of sourceMapPaths) {
    const sourceMap = JSON.parse(readFileSync(sourceMapPath, "utf8"));
    const referencedPaths = [
      sourceMap.sourceRoot,
      ...(sourceMap.sources ?? []),
    ].filter((value) => typeof value === "string");
    const absolutePath = referencedPaths.find(
      (path) =>
        path.startsWith("/") ||
        path.startsWith("file:") ||
        /^[A-Za-z]:[\\/]/.test(path),
    );

    if (absolutePath) {
      throw new Error(
        `Source map ${sourceMapPath} exposes an absolute path: ${absolutePath}`,
      );
    }
  }
}

function runJavaScriptConsumer(tarballPath) {
  const consumerDirectory = join(temporaryDirectory, "javascript-esm");
  const packageStoreDirectory = join(temporaryDirectory, "pnpm-store");

  cpSync(javascriptConsumerFixtureDirectory, consumerDirectory, {
    recursive: true,
  });

  console.log("Installing tarball in the JavaScript ESM consumer...");

  runPnpm(
    [
      "add",
      "--ignore-workspace",
      "--offline",
      "--ignore-scripts",
      "--save-exact",
      "--store-dir",
      packageStoreDirectory,
      tarballPath,
    ],
    {
      cwd: consumerDirectory,
      stdio: "inherit",
    },
  );

  console.log("Running the JavaScript ESM consumer smoke test...");

  execFileSync(process.execPath, ["index.js"], {
    cwd: consumerDirectory,
    stdio: "inherit",
  });
}

try {
  console.log("Building region-kit from a clean dist directory...");
  runPnpm(["--filter", "region-kit", "build"], { stdio: "inherit" });

  console.log("Packing region-kit into a temporary directory...");
  const packOutput = runPnpm(
    [
      "--filter",
      "region-kit",
      "pack",
      "--json",
      "--pack-destination",
      temporaryDirectory,
    ],
    { encoding: "utf8" },
  );
  const packReport = JSON.parse(packOutput);
  const tarballPath = resolve(packReport.filename);

  if (!existsSync(tarballPath)) {
    throw new Error(
      `pnpm pack did not create the reported tarball: ${tarballPath}`,
    );
  }

  if (dirname(tarballPath) !== resolve(temporaryDirectory)) {
    throw new Error(
      `pnpm pack created the tarball outside the temporary directory`,
    );
  }

  const packagePaths = auditPackageFiles(packReport.files);
  auditSourceMaps();
  runJavaScriptConsumer(tarballPath);

  console.log(
    `Distribution check passed for ${packReport.name}@${packReport.version} (${packagePaths.length} files).`,
  );
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
