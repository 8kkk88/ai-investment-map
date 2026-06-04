# AI Investment Map Case Study

## Overview

AI Investment Map is a frontend-only product demo that visualizes simulated AI ecosystem portfolios through a financial heatmap. The goal was not to clone an existing screen, but to rebuild the core product capability: helping users quickly understand which assets are held, how much they weigh, how they moved, and where they sit by sector.

Production demo: https://ai-investment-map-tawny.vercel.app/

GitHub release tags:

- `v0.1.0-frontend-demo`
- `v0.1.2-demo-polish`
- `v0.1.2-production-demo`

## Product Goal

Create a credible, shareable frontend demo for a fintech-style AI portfolio map.

The demo needed to prove:

- A treemap can make portfolio concentration easier to scan.
- Color-coded returns can communicate market movement at a glance.
- Sector grouping can add structure without overwhelming the view.
- A drawer can turn a tile click into a useful investment observation panel.
- Simulated data can be clearly marked without weakening the product story.

## User Pain Points

Market and portfolio data often appears as tables, long watchlists, or isolated charts. That makes it hard to answer fast exploration questions:

- Which names dominate this portfolio?
- Which holdings moved most today, this week, or this month?
- Which sectors drive the exposure?
- Is a position meaningful or just visually noisy?
- Can I inspect an asset without losing the market-wide view?

For fintech, exchange, and trading-tool users, the challenge is not only data volume. It is information hierarchy, latency expectations, risk disclosure, and trust in what the interface claims.

## MVP Decision Table

| Decision | Included In Demo | Reason |
|---|---:|---|
| Frontend-only app | Yes | Fastest way to validate the interaction and information design. |
| Simulated market data | Yes | Keeps the demo deployable without data licensing, API keys, or latency risk. |
| Treemap heatmap | Yes | Core product capability. |
| Portfolio selector | Yes | Demonstrates different AI ecosystem views. |
| Daily / Weekly / Monthly switch | Yes | Shows how the same holdings change across timeframes. |
| Sector filter | Yes | Adds controlled exploration without a full filtering system. |
| Market Movers rankings | Yes | Gives users a secondary scan path. |
| Asset drawer | Yes | Turns a tile into a deeper observation. |
| Real market data API | No | Requires vendor selection, licensing, caching, and latency design. |
| Auth / accounts | No | Not needed to validate the heatmap experience. |
| Database persistence | No | Local mock data is enough for a production demo. |
| Stripe / subscriptions | No | Commercial model belongs after product signal validation. |
| Trading or broker integration | No | Out of scope and would create regulatory/product risk. |

## Core UX Decisions

### Heatmap First

The first screen is the product, not a landing page. Users immediately see the map, portfolio controls, return period, sector filters, rankings, and asset details.

### Dense But Controlled

The visual language is dark, compact, and finance-oriented. The UI avoids marketing sections, oversized hero content, and decorative illustration because the product is a tool for repeated scanning.

### Two Scan Paths

Users can scan spatially through the heatmap or sequentially through Market Movers. This supports both visual exploration and list-based analysis.

### Drawer As Context, Not Advice

The drawer shows price, return, market cap, volume, portfolio weight, contribution, and sector rank. The insight sentence is data-driven and avoids any buy/sell recommendation.

## Heatmap Information Design

The treemap encodes three dimensions:

- Tile size: `weightPct`
- Tile color: selected-period `returnPct`
- Grouping: `sector`

Color logic:

- Deep green: strong positive return
- Green: positive return
- Neutral gray: flat return
- Red: negative return
- Deep red: strong negative return

The design intentionally keeps text minimal inside tiles:

- Symbol
- Return percentage
- Weight percentage on larger tiles

This keeps the map scannable while preserving enough information for demo-level inspection.

## Simulated Data Policy

The product uses local simulated data only. The UI explicitly labels the experience with:

- `Simulated market snapshot`
- `Simulated data`
- Drawer disclaimer: no investment advice or real-time market prices

This avoids misleading users and keeps the demo deployable without external credentials or licensed data feeds.

## AI-Assisted Development Workflow

AI was used as a development collaborator, not as an unbounded product generator. The workflow emphasized:

- Scope control before implementation
- Explicit non-goals
- Iterative MVP checkpoints
- Build verification after each phase
- Separate review-agent feedback loops
- Production demo validation before release tagging

The human product direction stayed central: defining the MVP boundary, deciding what not to build, setting review criteria, and approving phase transitions.

## Dual-Agent Validation Loop

The project used a build agent and a review/acceptance agent pattern:

1. Product scope was defined.
2. The build agent implemented only the approved slice.
3. The review agent scored the demo and identified P0/P1/P2 issues.
4. The build agent fixed only approved issues.
5. The project was revalidated with `npm.cmd run check`, local URL checks, and production checks.
6. Git tags were created after accepted milestones.

This helped prevent scope creep into backend, SaaS, auth, billing, or real data before the heatmap experience was proven.

## Validation Summary

Completed checks:

- `npm.cmd run check`: passed
- `http://127.0.0.1:3000`: 200
- `http://localhost:3000`: 200
- Production URL: 200
- Desktop production screenshot: dark UI and heatmap rendered
- Mobile 390px: no horizontal overflow
- Sector chips: horizontally scrollable with fade affordance
- Search: `dell`, `nvda`, and `pal` validated on production
- Drawer insight: positive, negative, and small-weight assets displayed reasonable contribution text
- Production console: no production-origin hydration issue found during review

## Tradeoffs

- Simulated data improves demo reliability but limits analytical truth.
- No backend keeps delivery fast but prevents persistence and personalization.
- No real data avoids licensing risk but requires clear disclosure.
- Desktop is stronger than mobile because the core heatmap is information-dense.
- Rankings and filters are intentionally minimal to avoid overbuilding Phase 1.

## Lessons Learned

- A polished frontend demo can validate product direction before backend investment.
- In financial interfaces, trust comes from data transparency and restrained claims.
- Dense tools need careful hierarchy; a dashboard should not feel like a landing page.
- Demo stability is a product requirement, not just an engineering concern.
- Review agents are most useful when acceptance criteria are explicit and narrow.
