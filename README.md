# Comet Tracker

Comet Tracker is a live observation dashboard for visible comets. It pulls free nightly observability data from NASA/JPL, ranks active targets, and presents them in a mission-control style interface with timing windows, orbit context, alerts, and operator notes.

## What it does

- Loads observable comet targets from JPL's Small-Body Observability API.
- Enriches each target with orbit metadata from the Small-Body Database API.
- Renders a cinematic control surface with:
  - live target queue
  - observatory dark-time summary
  - per-comet visibility scoring
  - rise, transit, and set windows
  - derived checklist items and watch alerts

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- TypeScript

## Data source

- JPL Small-Body Observability API
- JPL Small-Body Database API

The app currently defaults to MPC observatory code `F51` (Pan-STARRS 1, Haleakala). You can override that with `COMET_TRACKER_MPC_CODE`.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Validation

```bash
pnpm lint
pnpm build
```

## Production

- GitHub: [earlwlkr/comet-tracker](https://github.com/earlwlkr/comet-tracker)
- Vercel: [comet-tracker.vercel.app](https://comet-tracker.vercel.app)
