# Phase 2.2 Provider Decision Matrix

This document evaluates market data providers for a small Phase 2.2 proof of concept for AI Investment Map.

This is a planning document only. It does not start Phase 2.2 implementation, approve production real market data, create an API route, or authorize any provider key usage.

Last reviewed: 2026-06-05

## 1. Encoding And Readability

This file is written as English-only ASCII Markdown to avoid encoding risk.

Readability checks before commit:

- Open in VS Code and confirm the file is readable.
- Open GitHub Preview and confirm all tables render correctly.
- Search for mojibake patterns, corrupted text, or unexpected non-ASCII characters.
- Confirm no API key, token, account ID, or local absolute path appears.
- Confirm provider links are readable and clickable.

## 2. Evaluation Premise

Current product:

- AI Investment Map is an AI portfolio heatmap demo.
- Current production uses simulated market data.
- Phase 2.1 added a normalized provider architecture, mock provider, placeholder provider, and simulated fallback.

Phase 2.2 PoC premise:

- Use 20-50 symbols only.
- Start with US stocks and selected ETFs as listed securities.
- Use quote and daily bars only.
- Use server-side requests only.
- Keep simulated fallback.
- Production demo may use delayed or EOD data only if display rights are confirmed.
- No realtime trading.
- No broker or trading integration.
- No paid SaaS.
- No database, Redis, or Cron.
- No Auth, Stripe, billing, or subscriptions.
- No ETF or fund holdings ingestion.
- No investment advice.
- No official holdings claim for OpenAI, Anthropic, Nvidia, Google, Meta, or any other company.

## 3. Licensing And Display Risk Gate

Licensing and display risk is a hard go / no-go gate. It is not just a scoring item.

Hard gate rules:

- If the provider has not confirmed in writing that a public website may display real quotes or OHLC data, Production must remain `MARKET_DATA_MODE=simulated`.
- If the provider has not confirmed commercial display rights, public demo pages must not display real market data.
- If the provider has not confirmed redistribution rights, the product must not provide export, public API access, embed widgets, downloadable datasets, or third-party data access.
- Preview URLs are treated as public display unless access is private and controlled.
- Screenshots, case studies, demo videos, sales decks, and portfolio pages that show real provider data require display-rights review.
- Derived metrics require review. This includes heatmap colors, return percentages, return contribution, weighted returns, rankings, and sector aggregates.
- Cache rights must be confirmed before storing provider data beyond transient server-side processing.
- Production real data is prohibited until public display rights are confirmed.

Gate status for Phase 2.2:

| Gate | Required Before Production Provider Mode | Current Status |
|---|---|---|
| Public quote display | Written provider confirmation | Not confirmed |
| Public OHLC display | Written provider confirmation | Not confirmed |
| Commercial display | Written provider confirmation | Not confirmed |
| Delayed / EOD / realtime labeling | Written provider confirmation | Not confirmed |
| Screenshots and case study reuse | Written provider confirmation | Not confirmed |
| Derived metrics display | Written provider confirmation | Not confirmed |
| Cache retention | Written provider confirmation | Not confirmed |
| Export / public API / embed | Written provider confirmation | Not confirmed |

Production rule:

- Production must remain `MARKET_DATA_MODE=simulated` until the required display rights are confirmed.
- Preview must default to simulated unless display rights are confirmed.
- Local development may test provider mode in Phase 2.2 only after API key security is configured.

## 4. Data Labeling Gate

Market data labels are mandatory.

Rules:

- Do not claim realtime data unless the provider plan explicitly grants realtime data rights.
- Delayed data must be labeled as delayed.
- EOD data must be labeled as end-of-day.
- Simulated data must be labeled as simulated.
- Fallback data must be labeled as fallback or simulated fallback.
- Every market data response must preserve `source`, `asOf`, `isDelayed`, `isSimulated`, and `dataFreshness`.

Required UI labels:

| Data State | Required Label |
|---|---|
| Simulated | `Simulated market data` |
| Provider not configured | `Provider not configured. Showing simulated data.` |
| Delayed | `Delayed market data` |
| EOD | `End-of-day market data` |
| Partial | `Partial market data` |
| Stale | `Stale market data` |
| Realtime | Allowed only after explicit entitlement confirmation |

## 5. Provider Comparison

Provider facts must be rechecked before implementation because pricing, rate limits, and legal terms can change.

Official references:

- Alpha Vantage documentation: https://www.alphavantage.co/documentation/
- Alpha Vantage premium: https://www.alphavantage.co/premium/
- Alpha Vantage terms: https://www.alphavantage.co/terms_of_service/
- Twelve Data documentation: https://twelvedata.com/docs
- Twelve Data pricing: https://twelvedata.com/pricing
- Twelve Data commercial usage: https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- Finnhub documentation: https://www.finnhub.io/docs/api
- Finnhub pricing: https://finnhub.io/pricing
- Massive stocks documentation: https://massive.com/docs/rest/stocks/overview
- Massive pricing: https://massive.com/pricing
- Massive market data terms: https://massive.com/legal/market-data-terms-of-service

### Technical Fit

| Provider | Coverage | US Stocks | ETF Support | Quote Support | Daily Bars | Historical Data |
|---|---|---:|---:|---:|---:|---:|
| Alpha Vantage | Global equities, ETFs, symbol lookup, fundamentals | Yes | Yes | Yes | Yes | Yes |
| Twelve Data | Stocks, ETFs, funds, forex, crypto, global symbols | Yes | Yes | Yes | Yes | Yes |
| Finnhub | Stocks, company data, fundamentals, ETFs, news | Yes | Yes | Yes | Plan dependent | Plan dependent |
| Polygon / Massive | Strong US stocks market data, reference data, snapshots | Yes | Yes as listed securities | Yes | Yes | Yes |

### Product Fit

| Provider | Market Cap / Volume | Sector / Company Profile | Free Tier | Rate Limit Fit For 20-50 Symbols | Vercel Compatibility |
|---|---|---|---|---|---|
| Alpha Vantage | Volume from bars; market cap via company overview | Company overview available | Free tier exists but quota is tight | Low-medium | Good REST fit |
| Twelve Data | Volume from time series; market cap/profile depends on endpoint and plan | Profile/reference support varies by plan | Free tier exists with credits | Medium-high | Good REST fit |
| Finnhub | Quote and profile fields; market cap via company profile | Company profile is useful | Free tier useful for quote/profile | Medium | Good REST fit |
| Polygon / Massive | Strong OHLCV; ticker details can include market cap and industry fields | Strong ticker reference | Free tier exists but limited | Medium | Good REST fit |

### Risk Fit

| Provider | Delayed / Realtime | Public Display Risk | Terms / Licensing Risk | Implementation Complexity | Maintenance Risk |
|---|---|---|---|---|---|
| Alpha Vantage | Endpoint and plan dependent | Medium-high | Medium-high | Low | Medium |
| Twelve Data | Market and plan dependent | Medium-high until confirmed | Medium-high | Low-medium | Medium |
| Finnhub | Market and plan dependent | Medium-high | Medium-high | Medium | Medium-high |
| Polygon / Massive | Plan dependent; strong realtime options | High | High | Medium | Medium |

## 6. Endpoint Checklist

This checklist is for planning only. It does not approve endpoint use in production.

| Provider | Quote | Daily Bars / Time Series | Company Profile | Market Cap | Volume | Sector | ETF Support |
|---|---|---|---|---|---|---|---|
| Alpha Vantage | `GLOBAL_QUOTE` | `TIME_SERIES_DAILY`, weekly, monthly | `OVERVIEW` | `OVERVIEW` | Daily bars | `OVERVIEW` sector field | Symbol lookup and ETF endpoints exist |
| Twelve Data | `quote` | `time_series` with `1day` interval | Profile/reference endpoints | Plan and endpoint dependent | Time series | Plan and endpoint dependent | ETF symbols and ETF endpoints exist |
| Finnhub | `/quote` | `/stock/candle` | `/stock/profile2` | `/stock/profile2` | Candle response | `finnhubIndustry` in profile | ETF-related endpoints exist |
| Polygon / Massive | Snapshot, last trade, last quote | Aggregates, grouped daily, previous day | Ticker details | Ticker details | Aggregates and snapshots | Industry classification in ticker details | ETFs as supported tickers |

PoC endpoint preference:

- Use quote and daily bars only.
- Avoid realtime quote unless explicitly licensed.
- Avoid ETF holdings ingestion.
- Avoid full market snapshot unless quota and display rights are clear.

## 7. Twelve Data Pre-PoC Checklist

Twelve Data is the technical first choice for a small Phase 2.2 PoC. It is not production-approved.

Before enabling Twelve Data provider mode outside local development, confirm:

- Public demo pages may display quote data.
- Public demo pages may display daily OHLC data.
- Derived displays are allowed, including heatmap colors, return percentages, weighted return, return contribution, and rankings.
- Attribution requirements are clear.
- Exchange-level license requirements are clear for US stocks and ETFs.
- Screenshots, case study pages, demo videos, and portfolio decks may show real provider data.
- Provider data may be cached, and cache duration is known.
- Export, public API, embed widget, and downloadable artifact rights are clear.
- Vercel Preview URLs may use provider data.
- Individual plan and Business plan rights are understood.
- Delayed, EOD, and realtime labeling requirements are understood.
- Derived data may preserve source attribution.

If any item is not confirmed:

- Production must remain `MARKET_DATA_MODE=simulated`.
- Preview must remain simulated unless explicitly approved.
- Documentation must not imply real market data is live or production-approved.

## 8. Adjusted Scoring Model

Licensing and display rights are evaluated first as a hard gate. Only providers that pass the gate may be considered for production real-data display.

For technical PoC selection, use this weighted score after acknowledging gate status:

- Licensing / display readiness: 35%
- Data coverage: 20%
- Implementation simplicity: 15%
- Cost / free tier: 10%
- Rate limit: 10%
- Future scalability: 10%

Scoring scale:

- 1 = poor fit
- 2 = risky fit
- 3 = usable with caveats
- 4 = good fit
- 5 = strong fit

| Criteria | Weight | Alpha Vantage | Twelve Data | Finnhub | Polygon / Massive |
|---|---:|---:|---:|---:|---:|
| Licensing / display readiness | 35% | 2.0 | 2.5 | 2.0 | 1.5 |
| Data coverage | 20% | 3.5 | 4.5 | 3.5 | 5.0 |
| Implementation simplicity | 15% | 4.5 | 4.0 | 3.5 | 3.5 |
| Cost / free tier | 10% | 2.5 | 4.0 | 3.0 | 3.0 |
| Rate limit | 10% | 2.0 | 4.0 | 4.0 | 3.0 |
| Future scalability | 10% | 2.5 | 4.0 | 3.0 | 4.5 |
| Weighted technical PoC score | 100% | 2.75 | 3.50 | 2.85 | 3.20 |

Interpretation:

- Twelve Data is the best technical PoC candidate.
- Polygon / Massive is strong technically but carries the highest display and licensing caution.
- Finnhub is useful for quote/profile enrichment but is not the cleanest first daily-bars PoC.
- Alpha Vantage is simple but may be constrained by quota for 20-50 symbols.
- A higher technical score does not approve production display.
- Twelve Data is a technical PoC first choice, not production-approved.

## 9. Recommendation

Recommended Phase 2.2 PoC provider:

- Twelve Data

Reasons:

- Good fit for 20-50 symbols.
- Supports quote and daily time series use cases.
- REST API can be called server-side from Next.js.
- Easier to normalize into the Phase 2.1 provider architecture.
- Suitable for local or controlled development PoC if API key security is handled correctly.

Second choice:

- Polygon / Massive

Reasons:

- Strong US stocks data, aggregates, ticker details, and future scalability.
- Better candidate if the product later becomes a more serious market data tool.
- Licensing and display rights require stricter review before public use.

Do not prioritize first:

- Alpha Vantage: simple but quota risk is meaningful for 20-50 symbols.
- Finnhub: useful for profile and quote enrichment, but less ideal as the first quote plus daily bars provider.

## 10. Vercel Env Mode Policy

| Environment | Default Mode | Provider Mode Allowed | Rule |
|---|---|---:|---|
| Development | `simulated` | Yes | Local server-side testing only after API key setup. |
| Preview | `simulated` | Only after rights review | Treat Preview URLs as public display. |
| Production | `simulated` | No until confirmed | Real provider data is blocked until display rights are confirmed. |

Environment variable rules:

- `.env.example` may list empty key names only.
- `.env.local` may contain local API keys but must not be committed.
- Vercel env vars must be scoped by environment.
- Do not use `NEXT_PUBLIC_*` for provider API keys.
- Provider API keys are server-side only.
- Server logs, error logs, analytics events, and monitoring payloads must not output complete API keys.
- Do not include provider keys in README, docs, release notes, GitHub issues, pull requests, screenshots, or commits.

Example:

```env
MARKET_DATA_MODE=simulated
MARKET_DATA_PROVIDER=mock
MARKET_DATA_API_KEY=
```

## 11. Phase 2.2 Minimal PoC Scope

Included:

- 20-50 symbols.
- US stocks and selected ETFs as listed securities.
- Quote endpoint.
- Daily bars or time series endpoint.
- Server-side request only.
- Normalization into the existing `MarketDataProvider` architecture.
- Simulated fallback.
- Metadata preservation: `source`, `asOf`, `isDelayed`, `isSimulated`, `dataFreshness`, `fallbackReason`, `dataQuality`.
- UI behavior remains unchanged.

Excluded:

- Database.
- Redis.
- Cron.
- Auth.
- Stripe.
- SaaS plans.
- Broker integration.
- Trading.
- Realtime claim.
- ETF or fund holdings ingestion.
- Investment recommendation.
- Official holdings claim.
- Public API.
- Export.
- Embed widget.

## 12. Phase 2.2 Prohibited Items

Do not do the following in Phase 2.2:

- Do not add a database.
- Do not add Redis.
- Do not add Cron.
- Do not add authentication.
- Do not add Stripe or billing.
- Do not build SaaS plans.
- Do not connect a broker.
- Do not place trades.
- Do not ingest ETF or fund holdings.
- Do not make realtime market data claims.
- Do not show buy, sell, hold, target price, or recommendation labels.
- Do not claim official holdings for OpenAI, Anthropic, Google, Meta, Nvidia, or any other company.
- Do not expose provider data through export, public API, or embedded widget.
- Do not enable production real market data before display rights are confirmed.

## 13. Legal And Product Copy Rules

Required product language:

- `Simulated market data for product demonstration.`
- `This product does not provide investment advice, recommendations, or real-time trading signals.`
- `Model portfolios are thematic examples and are not official company holdings.`

Allowed ranking language:

- `Top Gainers`
- `Top Losers`
- `Largest Holdings`
- `Return Contribution`
- `Observed movement`

Disallowed language:

- `Buy`
- `Sell`
- `Hold`
- `Strong Buy`
- `Target Price`
- `Recommendation`
- `Official OpenAI holdings`
- `Official Anthropic holdings`
- `Official Nvidia portfolio`
- `Realtime data`, unless licensed and labeled correctly

## 14. Phase 2.2 Design Acceptance Criteria

The Phase 2.2 design is acceptable when:

- Provider recommendation is documented.
- Twelve Data is marked as technical PoC first choice, not production-approved.
- Licensing and display risk is a hard gate.
- Production real data is explicitly blocked until rights are confirmed.
- Preview URLs are treated conservatively.
- Screenshots, case studies, export, cache, public API, embed, and derived metrics rights are listed for review.
- Delayed, EOD, realtime, simulated, stale, partial, and fallback labels are defined.
- API key strategy is server-side only.
- No `NEXT_PUBLIC_*` provider key is allowed.
- Phase 2.2 scope remains 20-50 symbols, quote plus daily bars only.
- No DB, Redis, Cron, Auth, Stripe, SaaS, broker, trading, investment advice, or official holdings claim is introduced.
- `npm.cmd run check` passes after documentation changes.

## 15. Current Decision

Decision:

- Re-submit this matrix for review.
- Do not start Phase 2.2 implementation yet.
- Do not apply for or use an API key yet.
- Do not add an API route.
- Do not change Production from simulated data.
- Contact Twelve Data before any public demo or production use of provider data.

Phase 2.2 can begin only after this document is reviewed and accepted.
