# Screenshots Guide

This document describes the screenshots that should represent the production demo. Large images are not required in the repository yet. If screenshots are added later, compress them and place them in `docs/screenshots/`.

Production demo: https://ai-investment-map-tawny.vercel.app/

## Recommended Screenshots

### Desktop Dashboard

Suggested filename:

```text
docs/screenshots/production-desktop-1440.png
```

Capture:

- 1440px wide viewport
- Full dashboard top area
- Heatmap visible
- Market Movers visible
- Simulated market snapshot label visible

Caption:

> Desktop production demo showing simulated AI ecosystem holdings as a weighted treemap with Market Movers.

### Mobile Dashboard

Suggested filename:

```text
docs/screenshots/production-mobile-390.png
```

Capture:

- 390px mobile viewport
- Header controls
- Sector chips with scroll affordance
- Heatmap visible
- No horizontal overflow

Caption:

> Mobile production demo showing compact controls, scrollable sector chips, and tap-first heatmap interaction.

### Asset Drawer

Suggested filename:

```text
docs/screenshots/asset-drawer-insight.png
```

Capture:

- Any selected asset
- Price and return area
- Portfolio insight sentence
- No-investment-advice disclaimer

Caption:

> Asset drawer with data-driven contribution insight and simulated-data disclaimer.

## Screenshot Checklist

Before saving screenshots:

- CSS is loaded.
- Dark theme is visible.
- Heatmap tiles are rendered.
- No white fallback page is visible.
- No production-origin console errors.
- No hydration error is visible.
- Simulated-data label is visible.
- No investment advice is claimed.
- Mobile viewport has no horizontal overflow.

## Update Process

1. Open the production URL.
2. Confirm the release tag being captured.
3. Capture desktop and mobile screenshots.
4. Compress images before adding them to Git.
5. Place images under:

```text
docs/screenshots/
```

6. Update this document with final image paths.

## Current Screenshot Policy

Screenshots are documented but not committed in this phase to keep the repository lightweight. The production URL remains the primary demo reference.
