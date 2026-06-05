# Phase 2.2 Twelve Data PoC Implementation Plan

Status: Draft for review
Last reviewed: 2026-06-05

This document defines the minimum safe implementation plan for a Twelve Data proof of concept in AI Investment Map.

It is a design document only. It does not add code, request an API key, create an API route, enable provider mode, or approve production use of real market data.

## 1. Purpose

Phase 2.2 should prove that the Phase 2.1 provider architecture can safely consume a real market data provider in a small, controlled environment.

The goal is not to launch real market data in production. The goal is to validate:

- Server-side provider request boundaries.
- Quote and daily bars normalization.
- Return calculation from provider bars.
- Timeout, quota, partial, stale, and fallback behavior.
- Data status labeling.
- API key redaction and non-exposure.
- Preservation of the existing dashboard user experience.

## 2. Official References To Recheck

Provider documentation and licensing details can change. Recheck these official sources immediately before implementation:

- Twelve Data documentation: https://twelvedata.com/docs
- Twelve Data pricing: https://twelvedata.com/pricing
- Twelve Data commercial usage: https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- Twelve Data pre/post-market data: https://support.twelvedata.com/en/articles/5195429-pre-post-market-data
- Twelve Data batch requests: https://support.twelvedata.com/en/articles/5203360-bulk-requests

Key facts to verify before implementation:

- `/quote` exists for latest quote-style data.
- `/time_series` supports `interval=1day`.
- `/time_series` and `/quote` are documented as 1 API credit per symbol.
- The Basic plan lists 8 API credits per minute and 800 credits per day at the time of review.
- Individual plans are for personal or internal use and do not permit commercial display to third parties.
- Business plans allow commercial display and internal usage subject to exchange licensing requirements.
- Redistribution requires a separate agreement with Twelve Data.

## 3. Phase 2.2 Scope

Included:

- Use Twelve Data as a single provider PoC.
- Request data for 20-50 configured symbols.
- Start with US stocks and selected ETFs as listed securities.
- Use quote and daily bars only.
- Use server-side requests only.
- Normalize Twelve Data responses into the existing Phase 2.1 data model.
- Preserve simulated fallback.
- Preserve current UI behavior.
- Show provider status only through existing data status patterns.
- Keep Production in simulated mode.

Not included:

- No production real market data.
- No public provider mode.
- No realtime data claim.
- No broker or trading integration.
- No investment recommendation.
- No official holdings claim.
- No database.
- No Redis.
- No Cron.
- No Auth.
- No Stripe.
- No SaaS plans.
- No ETF or fund holdings ingestion.
- No public API.
- No export.
- No embed widget.

## 4. Pre-Implementation Gates

Do not start code implementation until all gates below are accepted by review.

Required gates:

- Provider decision matrix is accepted.
- This implementation plan is accepted.
- Production simulated-only rule is accepted.
- API key strategy is accepted.
- Redaction policy is accepted.
- Timeout and quota policy is accepted.
- Fallback policy is accepted.
- No investment advice language is accepted.

Licensing gates:

- Production real data remains blocked until written provider confirmation allows public quote or OHLC display.
- Preview defaults to simulated unless public display rights are confirmed.
- Screenshots, case studies, demo videos, cache, export, derived metrics, public API, and embed rights require review.
- Twelve Data is the technical PoC provider, not a production-approved data vendor.

## 5. Endpoint Plan

Phase 2.2 should use the smallest useful endpoint set.

Allowed endpoints for PoC:

| Endpoint | Purpose | Required | Notes |
|---|---|---:|---|
| `/quote` | Current price, change, volume-style quote fields | Yes | Server-side only. Do not claim realtime unless entitlement is confirmed. |
| `/time_series` | Daily OHLCV bars for return calculation | Yes | Use `interval=1day`; use a bounded `outputsize`. |

Deferred endpoints:

| Endpoint Type | Status | Reason |
|---|---|---|
| `/profile` or reference profile | Deferred | Existing mock asset metadata can provide name, sector, asset type, and market cap during PoC. |
| ETF holdings endpoints | Prohibited | Out of Phase 2.2 scope. |
| WebSocket endpoints | Prohibited | Realtime streaming is out of scope. |
| Recommendations, price target, ratings | Prohibited | Investment advice risk and out of scope. |
| Market movers endpoints | Prohibited | Rankings must continue to be computed from normalized PoC data. |

Recommended query shape:

- `symbol`: one configured symbol or a provider-supported batch input if reviewed.
- `interval`: `1day` for bars.
- `outputsize`: enough for monthly return calculation plus margin, for example 45-70 trading sessions.
- `country`: `United States` or `US` only if needed to disambiguate.
- `type`: `Common Stock` or `ETF` only if needed to disambiguate.

The implementation must not place API keys in client-visible query strings.

## 6. P2 Guardrails

These guardrails are required for implementation review. They are intended to prevent scope creep and keep provider logic separate from product transforms.

### 6.1 Provider Adapter Boundary

The Twelve Data adapter must implement only the existing pure data methods from the `MarketDataProvider` interface:

- `getAssets()`
- `getQuotes(symbols)`
- `getHistoricalBars(symbols, range)`
- `getPortfolioHoldings(portfolioId)`

The provider adapter must not implement:

- Heatmap calculation.
- Rankings calculation.
- Drawer detail composition.
- Portfolio impact insight.
- UI-specific transforms.

Heatmap, rankings, drawer detail, portfolio impact, and other product-specific transforms must remain in `dataService` or the transform layer.

### 6.2 Cache And Storage Restriction

Until provider display and cache rights are confirmed:

- Server-side provider fetch must use `no-store`.
- Do not add persistent cache.
- Do not add a database.
- Do not add Redis.
- Do not add Vercel KV.
- Do not store provider raw responses in the repo, client bundle, public files, screenshots, or exported artifacts.
- Do not provide export, public API access, or embed widgets.

### 6.3 Partial Data Threshold

Partial provider data is allowed only when enough symbols remain usable.

- If usable provider data is below 70% of requested symbols, fallback fully to simulated data.
- If usable provider data is 70% or higher, partial state may render.
- Partial state must be clearly labeled as partial or fallback.
- Partial data must not crash Heatmap, Search, Drawer, or Market Movers.
- Fallback behavior must preserve no-investment-advice wording.

### 6.4 Production Safety Rule

Until provider display rights are confirmed in writing:

- Production must remain `MARKET_DATA_MODE=simulated`.
- Twelve Data provider mode must not be enabled in Production.
- Production must not display real quote or OHLC data.
- Public demo copy must not claim delayed, realtime, live, or current market data.
- Preview URLs must be treated as public display unless authorization is confirmed.

### 6.5 Env And API Key Guard

API key handling must remain server-side only.

- Do not use `NEXT_PUBLIC_*` for provider API keys.
- API keys may be used only server-side.
- Do not log complete API keys.
- If a provider URL contains a key, error logs, server logs, and analytics events must redact it.
- Do not write API keys into GitHub, README, release notes, issues, pull requests, commits, screenshots, or documentation.

## 7. Server-Side Request Design

Provider requests must be server-side only.

Allowed request boundary:

- A Next.js server-only function or route handler may call Twelve Data in Phase 2.2.
- Client components must never call Twelve Data directly.
- Client bundles must not include provider base URLs with API keys.
- Provider keys must never use `NEXT_PUBLIC_*`.

Recommended internal flow:

```text
UI
  -> existing data service
  -> provider resolver
  -> Twelve Data server-side adapter
  -> normalize quote and bars
  -> compute returns
  -> attach metadata
  -> fallback if needed
  -> existing UI
```

Important:

- This document does not create the route or server function.
- The server boundary must be reviewed again before implementation.
- Production must keep simulated mode even if the server adapter exists.

## 8. Env And API Key Strategy

Environment variables:

```env
MARKET_DATA_MODE=simulated
MARKET_DATA_PROVIDER=mock
TWELVE_DATA_API_KEY=
```

Rules:

- `.env.example` may contain empty key names only.
- `.env.local` may contain the real key for local development only.
- Vercel Development env may contain a test key after review.
- Vercel Preview defaults to simulated unless display rights are confirmed.
- Vercel Production must remain simulated until display rights are confirmed.
- Do not use `NEXT_PUBLIC_*` for provider keys.
- Do not write API keys into README, docs, release notes, issues, PRs, screenshots, commits, or logs.

Environment policy:

| Environment | Default Mode | Provider Mode | Rule |
|---|---|---:|---|
| Local development | `simulated` | Allowed after key setup | Server-side only. |
| Vercel Development | `simulated` | Allowed after review | Server-side only. |
| Vercel Preview | `simulated` | Blocked unless rights confirmed | Treat preview URLs as public display. |
| Vercel Production | `simulated` | Blocked until rights confirmed | No real data in public production. |

## 9. Redaction Policy

All provider errors, logs, and diagnostics must redact secrets.

Must redact:

- API key values.
- Provider request URLs containing query parameters.
- Authorization headers if ever used.
- Raw provider error payloads that echo request URLs.
- Full symbol batches if logs become noisy or user-sensitive later.

Allowed safe logs:

- Provider name.
- Request type, such as `quote` or `time_series`.
- Symbol count.
- Elapsed time.
- Response status class.
- Internal error code.
- Whether fallback was used.

Disallowed logs:

- Full request URL with `apikey`.
- Full `.env.local` values.
- Raw provider response containing credentials.
- Client-side console logs with provider payloads.

Example safe diagnostic fields:

| Field | Example |
|---|---|
| provider | `twelve-data` |
| operation | `time_series` |
| symbolCount | `24` |
| elapsedMs | `820` |
| fallbackUsed | `true` |
| errorCode | `provider_timeout` |

## 10. Timeout, Quota, Partial, And Stale Handling

Timeout policy:

- Use a short timeout for each provider request.
- Recommended initial timeout: 4-6 seconds per request group.
- If the timeout is reached, return simulated fallback or partial data with metadata.
- Never leave the UI hanging while waiting for provider data.

Quota policy:

- Keep symbol count at 20-50.
- Prefer bounded requests.
- Do not run background refresh loops.
- Do not add Cron.
- Do not retry aggressively.
- If quota is exceeded, return fallback with `dataQuality=rateLimited`.

Partial data policy:

- If some symbols fail, keep valid symbols and mark the result as partial.
- Missing quotes should not crash heatmap, rankings, or drawer.
- Missing bars should prevent return calculation for that symbol and mark the result partial.
- Partial provider data may be mixed with simulated fallback only if metadata clearly states fallback behavior.
- If usable provider data is below 70% of requested symbols, fallback fully to simulated data.
- If usable provider data is 70% or higher, render partial state only with clear partial or fallback labeling.
- Partial data must not crash Heatmap, Search, Drawer, or Market Movers.

Stale data policy:

- Every result must include `asOf`.
- If `asOf` is older than the expected freshness window, mark `dataFreshness=stale`.
- Stale provider data must not be labeled as realtime.
- Stale data may still render if clearly labeled and not used for advice.

Suggested internal error codes:

| Code | Meaning | UI Impact |
|---|---|---|
| `provider_not_configured` | API key or provider mode missing | Simulated fallback |
| `provider_timeout` | Request timed out | Simulated or partial fallback |
| `provider_rate_limited` | Provider quota exceeded | Simulated fallback |
| `provider_partial` | Some symbols failed | Partial data label |
| `provider_stale` | Data is too old | Stale data label |
| `provider_parse_error` | Response shape unexpected | Simulated fallback |
| `provider_rights_blocked` | Environment not allowed for provider mode | Simulated fallback |

## 11. Fallback Strategy

Fallback is mandatory.

Fallback triggers:

- Provider mode disabled.
- Provider key missing.
- Provider rights blocked by environment.
- Timeout.
- Rate limit.
- Provider error.
- Invalid response shape.
- Missing required quote or bar fields.
- Partial result below usable threshold.
- Usable provider data below 70% of requested symbols.

Fallback output:

- Use existing simulated data.
- Preserve current heatmap, search, drawer, and rankings behavior.
- Attach metadata explaining fallback.
- Do not silently present fallback as real provider data.

Minimum metadata:

| Field | Expected Value On Fallback |
|---|---|
| `source` | `simulated` |
| `isSimulated` | `true` |
| `isDelayed` | `false` unless known otherwise |
| `fallbackReason` | Specific internal code |
| `dataQuality` | `simulated`, `notConfigured`, `providerError`, or `rateLimited` |
| `dataFreshness` | `unavailable` or `stale` when applicable |

## 12. Normalization Plan

Twelve Data responses must be normalized before touching UI code.

Quote normalization:

- Map provider symbol to internal symbol.
- Parse numeric fields safely.
- Treat missing numeric fields as `null`.
- Preserve provider timestamp or compute `asOf` from response metadata when available.
- Do not let one malformed quote crash the entire snapshot.

Daily bars normalization:

- Use `interval=1day`.
- Parse `datetime`, `open`, `high`, `low`, `close`, and `volume`.
- Sort bars in a deterministic order before return calculation.
- Drop invalid bars and mark partial if needed.
- Preserve exchange timezone metadata where available.

Return calculation:

- Daily return: latest close versus prior valid close.
- Weekly return: latest close versus the previous 5 valid trading sessions.
- Monthly return: latest close versus the previous 21 valid trading sessions.
- If bars are insufficient, mark that symbol partial and avoid fake return values.

Existing mock metadata:

- During Phase 2.2, sector, name, asset type, model portfolio weight, and thematic portfolio definition may continue to come from the local model data.
- Do not claim this local metadata represents official holdings.

## 13. Data Labeling

The UI must preserve data state transparency.

Required metadata fields:

- `source`
- `asOf`
- `isDelayed`
- `isSimulated`
- `fallbackReason`
- `dataQuality`
- `marketStatus`
- `dataFreshness`

Required labels:

| State | Label |
|---|---|
| Simulated | `Simulated market data` |
| Provider fallback | `Showing simulated fallback` |
| Delayed | `Delayed market data` |
| EOD | `End-of-day market data` |
| Partial | `Partial market data` |
| Stale | `Stale market data` |
| Realtime | Do not use unless explicitly licensed |

The PoC must not remove existing simulated data transparency.

## 14. Product And Legal Wording

Required language:

- `This product does not provide investment advice, recommendations, or real-time trading signals.`
- `Model portfolios are thematic examples and are not official company holdings.`
- `Production uses simulated market data unless provider display rights are confirmed.`

Allowed terms:

- `Model portfolio`
- `Thematic portfolio`
- `AI ecosystem basket`
- `Observed return`
- `Return contribution`
- `Largest holdings`
- `Top gainers`
- `Top losers`

Disallowed terms:

- `Buy`
- `Sell`
- `Hold`
- `Strong buy`
- `Target price`
- `Recommendation`
- `Official OpenAI holdings`
- `Official Anthropic holdings`
- `Official Nvidia portfolio`
- `Realtime data`, unless licensed and labeled correctly

## 15. Security Review Checklist

Before implementation review, confirm:

- No provider key in repo.
- No provider key in docs.
- No provider key in screenshots.
- No provider key in GitHub issues or PRs.
- No `NEXT_PUBLIC_*` provider key.
- No provider key in client bundle.
- No provider key in browser network request.
- No full provider URL with key in logs.
- No raw provider error payload with key.
- No public API route exposing provider data to third parties.

## 16. Testing And Acceptance Plan

Design acceptance criteria:

- This plan is reviewed and accepted.
- Provider Decision Matrix remains accepted.
- Production simulated-only rule remains in force.
- Twelve Data rights are not assumed.
- API key security design is accepted.
- Redaction policy is accepted.
- Timeout, quota, partial, stale, and fallback policies are accepted.

Future implementation acceptance criteria:

- `npm.cmd run check` passes.
- Provider mode works only in allowed environments.
- Production remains simulated unless rights are confirmed.
- Missing API key falls back to simulated.
- Provider timeout falls back safely.
- Rate limit falls back safely.
- Partial data does not crash heatmap, drawer, search, or rankings.
- No API key appears in client bundle or browser network requests.
- No investment advice, official holdings, or realtime claim is introduced.
- Existing UI behavior remains stable.

## 17. Prohibited Items

Phase 2.2 must not include:

- Database.
- Redis.
- Cron.
- Auth.
- Stripe.
- SaaS billing.
- Broker connection.
- Trading.
- ETF or fund holdings ingestion.
- Realtime streaming.
- Public API.
- Export.
- Embed widget.
- Investment advice.
- Official holdings claim.
- Production real data without display rights.

## 18. Current Decision

Current decision:

- Create this plan for review.
- Do not start Phase 2.2 implementation yet.
- Do not request or use a Twelve Data API key yet.
- Do not add API routes yet.
- Do not change Production mode.
- Keep Production simulated until display rights are confirmed.

After this document is approved, Phase 2.2 implementation may be scoped as a small server-side provider PoC.
