# AI Investment Map Frontend Demo

Single-page frontend MVP for an AI ecosystem stock heatmap. This demo is intentionally small: it uses local mock data only and does not include SaaS, auth, Stripe, backend APIs, databases, Redis, admin tools, watchlists, or real market data.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- D3 treemap
- Local mock data

## Quick Start

On Windows PowerShell, use `npm.cmd` if npm script execution is blocked.

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

`http://localhost:3000` should also work. The Next.js dev server writes to `.next-dev/`, while production builds write to `.next/`; this keeps `npm run build` from corrupting an active demo server.

Windows equivalent:

```powershell
npm.cmd install
npm.cmd run dev
```

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

Combined check:

```bash
npm run check
```

## Demo Script

1. Open the dashboard at `http://127.0.0.1:3000`.
2. Confirm the dashboard is dark styled, the heatmap is hydrated, and tiles are visible.
3. Point out that tile size follows `weightPct`.
4. Point out that tile color follows selected period `returnPct`.
5. Switch between `Daily`, `Weekly`, and `Monthly` to show color changes.
6. Switch portfolio from `OpenAI Ecosystem` to `Nvidia Ecosystem` or `AI Platforms`.
7. Use the sector chips to focus the map on a sector such as `Semiconductors` or `Cloud`.
8. Review the right-side rankings: `Top Gainers`, `Top Losers`, and `Largest Holdings`.
9. Click a tile such as `NVDA`, `MSFT`, or `GOOGL` to open the asset drawer.
10. Search by symbol or company name, then select a result to open the same drawer.
11. Resize to mobile width to show that the controls, heatmap, rankings, and drawer remain usable.

## Demo Stability Checklist

Before a live demo:

```powershell
npm.cmd run check
npm.cmd run dev
```

Then verify both URLs return the dashboard:

```text
http://127.0.0.1:3000
http://localhost:3000
```

If the browser ever shows a stale runtime error, stop the dev server and restart `npm run dev`. The dev and build artifact folders are now separated, so running `npm run build` should not poison the active dev artifact directory.

## Mock Data

Mock data lives in:

```text
data/mock-market.ts
```

Each asset includes:

- `symbol`
- `name`
- `sector`
- `assetType`
- `price`
- `marketCap`
- `volume`
- `marketCapBucket`
- `daily`, `weekly`, and `monthly` returns

Each portfolio includes a list of holdings with `assetId` and `weightPct`.

## Known Notes

- This is a frontend-only demo. All data is local and static.
- Mobile is usable but still secondary to the desktop demo surface.
- `npm audit` currently reports 2 moderate items from Next's nested PostCSS dependency. The suggested npm fix is a breaking downgrade path and was not applied.
- Filters and rankings are intentionally minimal in Phase 1.1.
