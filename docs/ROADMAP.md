# Roadmap

This roadmap separates current demo scope from future product directions. The current production demo is frontend-only and uses simulated data.

## Current Scope

Included today:

- Next.js frontend demo
- Simulated AI ecosystem portfolios
- Treemap heatmap
- Portfolio selector
- Daily / Weekly / Monthly views
- Sector filter chips
- Market Movers rankings
- Asset search
- Asset drawer with contribution insight
- Vercel production deployment

Not included today:

- Backend API
- Authentication
- Database
- Stripe or billing
- Real market data
- Watchlists
- Custom portfolios
- Alerts
- Trading
- Investment advice

## Phase 2: Product Data Layer

Phase 2 should focus on turning the demo into a data-backed product prototype without jumping directly into SaaS complexity.

Potential work:

- Market data vendor evaluation
- Data licensing review
- Quote and historical return adapters
- ETF/fund holdings source review
- API layer for heatmap data
- Cache strategy for quote and portfolio snapshots
- Portfolio data validation
- Data freshness labels
- Error states for missing or delayed data
- Watchlist prototype
- Custom portfolio prototype

Success criteria:

- Data source is legally usable.
- Latency and freshness are visible to users.
- Heatmap calculations are reproducible.
- The UI remains stable when data is incomplete.

## Phase 3: SaaS Commercialization

Auth, Stripe, database, and SaaS plans belong here, not in the current demo.

Potential work:

- User accounts
- Saved watchlists
- Custom portfolios
- PostgreSQL persistence
- Subscription plans
- Stripe checkout and billing portal
- API rate limits
- Team workspace
- Role-based access
- Usage analytics
- Admin data-health tools

Commercial directions:

- Free demo tier
- Pro individual tier
- Team workspace
- Enterprise data/API tier
- White-label heatmap widget

## Legal And Data Considerations

Before using real market data:

- Confirm data vendor rights and display terms.
- Define delayed versus real-time data expectations.
- Show clear data timestamps.
- Add data source attribution.
- Add error states for stale or unavailable data.
- Keep no-investment-advice language visible.
- Avoid buy/sell/hold recommendation language.
- Avoid implying official holdings for companies such as OpenAI, Anthropic, Google, Meta, or Nvidia.

## Out Of Scope Until Later

- Broker connection
- Order placement
- Portfolio optimization recommendations
- Personalized investment advice
- Tax reporting
- Compliance-grade reporting
- Real-time tick-by-tick trading UI

## Phase 2 Questions To Answer

- Which data vendor can legally support this use case?
- How fresh does the data need to be for the target user?
- Should AI portfolios be editorial models, rules-based baskets, or user-configurable groups?
- What calculations should be server-side versus client-side?
- What user behavior would justify SaaS investment?
- Which workflows deserve persistence first: watchlist, custom portfolio, or alerts?
