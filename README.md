# AI Investment Map

Production demo: https://ai-investment-map-tawny.vercel.app/

AI Investment Map is a frontend-only market heatmap demo for exploring simulated AI ecosystem portfolios. It focuses on one product question: can a dense set of holdings, returns, and sector exposure be made easier to scan through a dark, financial-tool-style treemap?

This is not an investment product. All market data is simulated/local demo data, and the app does not provide investment advice, portfolio advice, stock-picking recommendations, or real-time market prices.

## Current Scope

- Frontend-only Next.js demo
- Simulated AI ecosystem portfolios
- Treemap heatmap where tile size maps to `weightPct`
- Tile color maps to selected-period `returnPct`
- Daily / Weekly / Monthly period switching
- Sector filter chips
- Market Movers rankings
- Asset search
- Asset drawer with portfolio contribution insight
- Desktop-first layout with mobile demo support

Not included:

- Backend API
- Authentication or accounts
- Database persistence
- Stripe, billing, or subscriptions
- Real market data feeds
- Broker integration or trading
- Investment advice

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- D3 treemap
- Local simulated data
- Vercel deployment

## Documentation

- [Case Study](docs/CASE_STUDY.md)
- [Roadmap](docs/ROADMAP.md)
- [Demo Script](docs/DEMO_SCRIPT.md)
- [Screenshots Guide](docs/SCREENSHOTS.md)

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

`http://localhost:3000` should also work. The Next.js dev server writes to `.next-dev/`, while production builds write to `.next/`; this keeps `npm run build` from corrupting an active demo server.

## Verification

```bash
npm run check
```

Windows PowerShell:

```powershell
npm.cmd run check
```

This runs:

- `next typegen && tsc --noEmit`
- `eslint .`
- `next build`

## Demo Flow

1. Open the production demo or local dev URL.
2. Explain that the dashboard uses simulated data.
3. Switch AI portfolios.
4. Switch Daily / Weekly / Monthly.
5. Use sector chips to focus the heatmap.
6. Review Market Movers.
7. Search for `nvda`, `dell`, or `pal`.
8. Click a tile or search result to open the drawer.
9. Point out portfolio contribution and sector rank context.
10. On mobile, use `View rankings` to jump to Market Movers.

## Release Tags

- `v0.1.0-frontend-demo`
- `v0.1.2-demo-polish`
- `v0.1.2-production-demo`

## Known Notes

- All data is local and simulated.
- The production demo is designed for product/portfolio presentation, not investment decision-making.
- Mobile is usable, but desktop is the primary demo surface.
- `npm audit` currently reports moderate items from Next's nested PostCSS dependency; npm's suggested fix is a breaking downgrade and was not applied.
