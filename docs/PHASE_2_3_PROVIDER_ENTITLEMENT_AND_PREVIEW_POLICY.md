# Phase 2.3 Provider Entitlement And Preview Policy

Status: Draft for review
Last reviewed: 2026-06-05

This document defines the entitlement confirmation process, preview-only provider smoke strategy, and internal route access/display policy for AI Investment Map.

This is a design document only. It does not change code, configure API keys, update Vercel environments, enable provider mode, or add product functionality.

## 1. Phase 2.3 Goal

Phase 2.3 defines the policy layer required before any broader Twelve Data provider testing.

Goals:

- Define the Twelve Data entitlement checklist before public or preview real-data display.
- Define a preview-only provider smoke test strategy.
- Define the access and display policy for `/api/internal/market-data/dashboard`.
- Keep Production simulated until display rights are confirmed.
- Prevent API key exposure, public API misuse, investment advice wording, and unauthorized market data display.

Current state:

- `v0.2.3-twelve-data-server-side-poc` has passed production smoke testing.
- Production URL is healthy.
- Production still uses simulated data.
- Twelve Data provider mode is not enabled in Production.
- The internal dashboard route exists and currently returns simulated data in Production.
- No API key exposure has been observed.
- No external Twelve Data request has been observed in Production.
- No P0 or P1 issues are open.

## 2. Out Of Scope For This Phase

Phase 2.3 does not include:

- No real provider mode in Production.
- No Production provider API key.
- No paid SaaS.
- No Auth.
- No Stripe.
- No database.
- No Redis.
- No Vercel KV.
- No Cron.
- No broker integration.
- No trading.
- No investment recommendation.
- No public API.
- No export.
- No embed widget.
- No realtime or live market data claim.
- No code changes.
- No API request implementation changes.
- No Vercel environment changes.

## 3. Twelve Data Entitlement Checklist

Before any preview or public real-data display, confirm the following with Twelve Data documentation or support.

Official sources to recheck:

- Twelve Data documentation: https://twelvedata.com/docs
- Twelve Data pricing: https://twelvedata.com/pricing
- Twelve Data commercial usage: https://support.twelvedata.com/en/articles/5332349-commercial-and-personal-usage
- Twelve Data batch requests: https://support.twelvedata.com/en/articles/5203360-bulk-requests
- Twelve Data contact: https://twelvedata.com/contact

Entitlement checklist:

| Topic | Question | Required Outcome |
|---|---|---|
| Public quote display | Can a public website display quote data? | Written confirmation before public display. |
| Public OHLC display | Can a public website display daily OHLC data? | Written confirmation before public display. |
| Preview URL display | Does a Vercel Preview URL count as public display? | Treat as public unless confirmed otherwise. |
| Production demo display | Can production demo pages show delayed or EOD data? | Written confirmation before Production provider mode. |
| Derived display | Are heatmap colors, rankings, weighted returns, and contribution metrics allowed? | Written confirmation before display. |
| Screenshots | Can screenshots show real provider data? | Written confirmation before portfolio or case study usage. |
| Case study | Can a portfolio case study show real provider data? | Written confirmation before publishing. |
| Attribution | Is attribution required? | Must know exact wording and placement. |
| Exchange license | Is exchange-level licensing required for US stocks or ETFs? | Must be clear before display. |
| Cache | Is server-side cache or retention allowed? | No persistent cache until confirmed. |
| Export | Is export or downloadable data allowed? | Not allowed unless separate rights are confirmed. |
| Internal route | Can an internal route return normalized real data to first-party UI? | Must be confirmed before provider preview. |
| Individual plan | What does an Individual plan allow? | Must not assume public or commercial display. |
| Business plan | What does a Business plan allow? | Must confirm commercial display and exchange-license limits. |

Default rule:

- If any required entitlement is unclear, Production must remain `MARKET_DATA_MODE=simulated`.

## 4. Vercel Environment Policy

Environment policy:

| Environment | Default Mode | Provider Mode | API Key | Sharing Policy |
|---|---|---:|---:|---|
| Development | `simulated` | Allowed for controlled local test | Server-side only | Local only |
| Preview | `simulated` | Blocked unless entitlement review allows it | Server-side only | Do not share publicly unless entitlement is confirmed |
| Production | `simulated` | Blocked until display rights are confirmed | Do not configure before approval | Public production demo |

Rules:

- Production always defaults to simulated.
- Preview defaults to simulated.
- Provider mode is allowed only in controlled Preview or local development testing.
- Do not use `NEXT_PUBLIC_*` for provider API keys.
- API keys are server-side only.
- Preview test URLs must not be publicly shared unless entitlement has been confirmed.
- Production provider mode must not be enabled until display rights are confirmed.
- Production real quote or OHLC display is prohibited until entitlement is confirmed.

## 5. Internal Route Boundary Policy

Route under policy:

```text
/api/internal/market-data/dashboard
```

Policy:

- This route is not a public API product.
- This route is for first-party dashboard data only.
- Do not provide third-party usage.
- Do not provide export.
- Do not provide embed.
- Do not provide raw provider responses.
- Do not expose provider URLs.
- Do not expose API keys.
- Do not expose raw provider payloads.
- Do not include a URL that can be used to infer or recover a key.
- Production must return simulated data until display rights are confirmed.
- If provider mode is enabled in a future preview, access, display, attribution, and entitlement must be checked again.

Allowed response shape:

- Normalized dashboard data.
- Normalized metadata.
- Data status fields such as `source`, `asOf`, `isDelayed`, `isSimulated`, `fallbackReason`, `dataQuality`, `marketStatus`, `dataFreshness`, and `priceAdjustmentPolicy`.

Disallowed response shape:

- Raw Twelve Data payload.
- Provider request URL.
- API key or partial API key.
- Authorization headers.
- Export-ready market data tables for third-party use.
- Any buy, sell, hold, target price, or recommendation field.

## 6. Preview-only Provider Smoke Test Plan

This is a future test plan only. Do not execute it until entitlement and environment gates pass.

Preparation:

- Confirm entitlement assumptions for Preview.
- Configure Preview environment API key only after approval.
- Set Preview `MARKET_DATA_MODE=provider`.
- Set Preview `MARKET_DATA_PROVIDER=twelve-data`.
- Keep Production `MARKET_DATA_MODE=simulated`.
- Do not configure Production provider API key.

Smoke test steps:

1. Load the Preview URL in a controlled environment.
2. Confirm Production URL still shows simulated data.
3. Request 20-50 configured symbols.
4. Confirm quote data resolves through the internal route.
5. Confirm daily bars resolve through the internal route.
6. Confirm heatmap renders.
7. Confirm portfolio selector works.
8. Confirm Daily / Weekly / Monthly works.
9. Confirm sector filter works.
10. Confirm search works.
11. Confirm drawer works.
12. Confirm Market Movers works.
13. Trigger or simulate missing key fallback.
14. Trigger or simulate quota / rate limit fallback.
15. Trigger or simulate timeout fallback.
16. Trigger or simulate partial data.
17. Trigger or simulate stale data.
18. Confirm client bundle has no key.
19. Confirm browser network has no direct Twelve Data request.
20. Confirm server logs do not include full key or provider URL with key.
21. Confirm no investment advice claim or recommendation wording appears, except required disclaimers.
22. Confirm no positive official holdings claim appears; disclaimer wording such as "not official company holdings" is allowed.

Expected results:

- Preview may show provider, partial, delayed, EOD, or fallback labels only if entitlement allows it.
- Production remains simulated.
- Client never calls Twelve Data directly.
- API key never appears in client bundle, browser network, logs, screenshots, docs, or release notes.

## 7. Security And Redaction Policy

Security rules:

- Server logs must not print a complete API key.
- Error payloads must not include a complete provider URL.
- Analytics events must not include API keys.
- Client bundles must not include API keys.
- Browser network requests must not include provider keys.
- GitHub files must not contain API keys.
- README must not contain API keys.
- Release notes must not contain API keys.
- GitHub issues must not contain API keys.
- Pull requests must not contain API keys.
- Commits must not contain API keys.
- Screenshots must not contain API keys or provider request URLs.

If a key is exposed:

1. Revoke the exposed key immediately.
2. Rotate to a new key.
3. Remove or redact the exposed value from logs, docs, comments, screenshots, or commits where possible.
4. Check whether GitHub history, Vercel logs, or shared screenshots were affected.
5. Re-run client bundle and network exposure checks.
6. Document the incident and remediation.

## 8. Legal And Product Copy Policy

Required product constraints:

- No investment advice.
- No recommendation language.
- No buy / sell / hold labels.
- No target price.
- No official holdings claim.
- No realtime or live market data claim unless explicitly licensed and labeled.
- Delayed, EOD, and simulated data must be clearly labeled.
- Model portfolios must be described as model portfolios, thematic portfolios, or ecosystem baskets.

Allowed copy:

- `Simulated market data for product demonstration.`
- `Delayed market data`, only if entitlement allows delayed data display.
- `End-of-day market data`, only if entitlement allows EOD data display.
- `Model portfolios are thematic examples and are not official company holdings.`
- `This product does not provide investment advice, recommendations, or real-time trading signals.`

Disallowed copy:

- `Buy`
- `Sell`
- `Hold`
- `Strong Buy`
- `Target Price`
- `Recommendation`
- `Official OpenAI holdings`
- `Official Anthropic holdings`
- `Official Nvidia portfolio`
- `Live market data`
- `Realtime market data`, unless explicitly licensed and labeled

## 9. Go / No-Go Criteria

Go criteria for a future Preview provider test:

- Entitlement checklist is initially confirmed.
- Preview environment policy is complete.
- Internal route policy is complete.
- API key redaction checks are complete.
- Fallback test plan is complete.
- Production simulated-only rule is verified.
- Client bundle key exposure check is available.
- Browser network direct-provider check is available.
- Server log redaction check is available.

No-Go criteria:

- Display rights are unclear.
- API key could reach the client.
- Production could enable provider mode.
- The internal route could be interpreted as a public API.
- Fallback is missing or untested.
- Wording contains investment advice risk.
- Wording implies official AI company holdings.
- Wording claims live or realtime market data without entitlement.
- Cache or export rights are unclear but provider data would be stored or exported.

Decision rule:

- If any No-Go condition is present, do not run a provider preview test.
- If all Go conditions are satisfied, a controlled Preview-only smoke test may be planned.

## 10. Recommended Commit And Tag

Recommended commit message:

```text
docs: add phase 2.3 provider entitlement and preview policy
```

Recommended tag:

```text
v0.2.4-provider-entitlement-preview-policy
```

GitHub Release:

- Not required for this design-only policy document.
- Optional if the team wants a formal documentation milestone.

## 11. Current Decision

Current decision:

- Do not enter the next implementation phase.
- Do not configure API keys.
- Do not change Vercel environments.
- Do not enable provider mode in Preview or Production.
- Submit this policy document for review.

Production remains simulated.
