# Demo Script

Production demo: https://ai-investment-map-tawny.vercel.app/

## 30-Second Intro

AI Investment Map is a frontend demo for exploring simulated AI ecosystem portfolios through a financial heatmap. The goal is to make holdings, weights, returns, and sector exposure easier to scan than a table. This version uses simulated data only and does not provide investment advice or real-time market prices.

## 3-Minute Demo Route

### 1. Open The Dashboard

Open the production URL and point out:

- Dark financial-tool layout
- Heatmap as the primary surface
- Portfolio selector
- Daily / Weekly / Monthly controls
- Sector chips
- Market Movers

Talking point:

> This is not a landing page. The first screen is the product experience.

### 2. Explain The Heatmap

Point to the treemap:

- Larger tiles mean higher portfolio weight.
- Green/red color means selected-period return.
- Sectors group related holdings.

Talking point:

> The map helps users identify concentration and movement at the same time.

### 3. Switch Portfolio

Switch from `OpenAI Ecosystem` to another portfolio.

Explain:

- The holdings and weights update.
- The map layout changes based on the selected portfolio.

### 4. Switch Time Period

Click:

- Daily
- Weekly
- Monthly

Explain:

- The same portfolio can tell a different story depending on timeframe.
- Color changes reflect selected-period return.

### 5. Use Sector Chips

Click `Cloud`, `Semiconductors`, or `AI Infrastructure`.

Explain:

- Sector filtering narrows the map without leaving the dashboard.
- The summary stats and rankings follow the filtered view.

### 6. Review Market Movers

Use the tabs:

- Top Gainers
- Top Losers
- Largest Holdings

Talking point:

> Market Movers gives list-based scanning alongside the spatial map.

### 7. Search

Search examples:

- `nvda`
- `dell`
- `pal`

Click a result to open the drawer.

### 8. Drawer Insight

In the drawer, point out:

- Latest simulated price
- Selected-period return
- Portfolio weight
- Return contribution
- Sector rank
- No-investment-advice disclaimer

Talking point:

> The drawer is intentionally data-driven. It adds context without making recommendations.

### 9. Mobile Flow

Resize or open mobile view.

Show:

- Search and controls are usable.
- Sector chips scroll horizontally with a fade hint.
- `View rankings` jumps to Market Movers.
- Tapping a tile opens details.

## What Not To Claim

Do not say:

- This uses real-time market data.
- This is investment advice.
- This recommends stocks.
- These are official company holdings.
- This includes accounts, billing, database persistence, or backend APIs.

Safe wording:

- Simulated market snapshot
- Frontend production demo
- AI ecosystem portfolio model
- Data visualization prototype
- No investment advice

## Backup Plan

If the Vercel demo is unavailable:

1. Run local dev:

```powershell
npm.cmd run dev
```

2. Open:

```text
http://127.0.0.1:3000
```

3. If local dev is unavailable, use screenshots documented in [Screenshots Guide](SCREENSHOTS.md).

Before live demos, run:

```powershell
npm.cmd run check
```
