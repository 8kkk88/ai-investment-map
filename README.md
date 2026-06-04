# AI Investment Map Frontend Demo

Single-page frontend MVP for an AI ecosystem stock heatmap. This demo is intentionally small: it uses local mock data only and does not include SaaS, auth, Stripe, backend APIs, databases, Redis, admin tools, watchlists, rankings, or real market data.

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
2. Point out that tile size follows `weightPct`.
3. Point out that tile color follows selected period `returnPct`.
4. Switch between `Daily`, `Weekly`, and `Monthly` to show color changes.
5. Switch portfolio from `OpenAI Ecosystem` to `Nvidia Ecosystem` or `AI Platforms`.
6. Click a tile such as `NVDA`, `MSFT`, or `GOOGL` to open the asset drawer.
7. Search by symbol or company name, then select a result to open the same drawer.
8. Resize to mobile width to show that the controls, heatmap, and drawer remain usable.

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
- Mobile is intentionally basic for MVP; desktop is the primary demo surface.
- `npm audit` currently reports 2 moderate items from Next's nested PostCSS dependency. The suggested npm fix is a breaking downgrade path and was not applied.
- If the dev server shows a transient 500 after running production build while dev is already running, stop and restart `npm run dev`.
