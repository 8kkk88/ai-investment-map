import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "lib/market-data/types.ts",
  "lib/market-data/computeReturns.ts",
  "lib/market-data/dataService.ts",
  "lib/market-data/providers/mockProvider.ts",
  "lib/market-data/providers/realProviderPlaceholder.ts",
  ".env.example"
];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    fail(`Missing required Phase 2.1 file: ${relativePath}`);
  }
}

const placeholderSource = fs.readFileSync(
  path.join(root, "lib/market-data/providers/realProviderPlaceholder.ts"),
  "utf8"
);

if (/\bfetch\s*\(/.test(placeholderSource) || /https?:\/\//.test(placeholderSource)) {
  fail("realProviderPlaceholder must not call fetch or reference external URLs.");
}

const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");

if (/NEXT_PUBLIC_.*(?:API|KEY|TOKEN|SECRET)/.test(envExample)) {
  fail(".env.example must not expose provider keys with NEXT_PUBLIC_*.");
}

if (/MARKET_DATA_API_KEY=.+/.test(envExample)) {
  fail(".env.example must not contain a real MARKET_DATA_API_KEY value.");
}

const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
const requiredGitIgnores = [".env", ".env.local", ".env.*.local"];

for (const pattern of requiredGitIgnores) {
  if (!gitignore.includes(pattern)) {
    fail(`.gitignore must include ${pattern}`);
  }
}

const marketDataSource = readDirectory(path.join(root, "lib/market-data"));

if (/NEXT_PUBLIC_.*(?:API|KEY|TOKEN|SECRET)/.test(marketDataSource)) {
  fail("Market data layer must not use NEXT_PUBLIC_* provider key names.");
}

console.log("Market data contract safety checks passed.");

function readDirectory(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .map((entry) => {
      const absolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return readDirectory(absolutePath);
      }

      if (!entry.name.endsWith(".ts")) {
        return "";
      }

      return fs.readFileSync(absolutePath, "utf8");
    })
    .join("\n");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
