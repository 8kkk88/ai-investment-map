import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "lib/market-data/types.ts",
  "lib/market-data/computeReturns.ts",
  "lib/market-data/dataService.ts",
  "lib/market-data/serverDataService.ts",
  "lib/market-data/providers/mockProvider.ts",
  "lib/market-data/providers/realProviderPlaceholder.ts",
  "lib/market-data/providers/twelveDataProvider.ts",
  "app/api/internal/market-data/dashboard/route.ts",
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

if (!/^MARKET_DATA_MODE=simulated$/m.test(envExample)) {
  fail(".env.example must keep MARKET_DATA_MODE simulated by default.");
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

const twelveProviderPath = path.join(root, "lib/market-data/providers/twelveDataProvider.ts");
const twelveProviderSource = fs.readFileSync(twelveProviderPath, "utf8");

if (!/import\s+["']server-only["']/.test(twelveProviderSource)) {
  fail("Twelve Data provider must be marked server-only.");
}

if (!/cache:\s*["']no-store["']/.test(twelveProviderSource)) {
  fail("Twelve Data provider fetch must use cache: \"no-store\".");
}

if (/getHeatmapData|getRankings|getAssetDetail|portfolio impact insight/i.test(twelveProviderSource)) {
  fail("Twelve Data provider must not implement UI/domain transform methods.");
}

if (/console\.(log|error|warn|info)/.test(twelveProviderSource)) {
  fail("Twelve Data provider must not log provider responses or API-key-bearing URLs.");
}

const serverDataServiceSource = fs.readFileSync(
  path.join(root, "lib/market-data/serverDataService.ts"),
  "utf8"
);

if (!/import\s+["']server-only["']/.test(serverDataServiceSource)) {
  fail("Server market data service must be marked server-only.");
}

if (!/VERCEL_ENV\s*===\s*["']production["']/.test(serverDataServiceSource)) {
  fail("Server market data service must block provider mode in Vercel production.");
}

const routeSource = fs.readFileSync(
  path.join(root, "app/api/internal/market-data/dashboard/route.ts"),
  "utf8"
);

if (!/Cache-Control["']?:\s*["']no-store/.test(routeSource)) {
  fail("Internal dashboard route must return no-store cache headers.");
}

const clientSource = [
  readDirectory(path.join(root, "components")),
  fs.readFileSync(path.join(root, "app/page.tsx"), "utf8"),
  fs.readFileSync(path.join(root, "app/layout.tsx"), "utf8")
].join("\n");

if (/api\.twelvedata\.com|MARKET_DATA_API_KEY|TWELVE_DATA_API_KEY|apikey=/.test(clientSource)) {
  fail("Client source must not reference Twelve Data URLs or provider API keys.");
}

const twelveDataUrlMatches = readRepositoryText().match(/api\.twelvedata\.com/g) ?? [];

if (twelveDataUrlMatches.length !== 1 || !twelveProviderSource.includes("api.twelvedata.com")) {
  fail("Twelve Data base URL must appear only in the server-only provider adapter.");
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

function readRepositoryText() {
  return [
    readDirectory(path.join(root, "lib")),
    readDirectory(path.join(root, "app")),
    readDirectory(path.join(root, "components")),
    readDirectory(path.join(root, "scripts"))
  ].join("\n");
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
