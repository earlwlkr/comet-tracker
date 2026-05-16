# NASA Signal Desk

A mission-control dashboard that surfaces live NASA data across 16 dedicated views. Built as a clean desk for signals that are worth checking now.

## Live data views

| Route | Source | What it shows |
|---|---|---|
| `/apod` | api.nasa.gov | Astronomy Picture of the Day with daily context |
| `/eonet` | eonet.gsfc.nasa.gov | Open natural events with category filtering |
| `/donki` | api.nasa.gov | Space weather events on an operational timeline |
| `/images` | images-api.nasa.gov | Searchable NASA media library |
| `/neows` | api.nasa.gov | Near-Earth object approaches |
| `/exoplanet` | exoplanetarchive.ipac.caltech.edu | Recent exoplanet discoveries |
| `/epic` | api.nasa.gov | Daily DSCOVR Earth imagery |
| `/gibs` | earthdata | Global imagery layer previews |
| `/insight` | api.nasa.gov (archive) | Final InSight Mars weather archive |
| `/osdr` | visualization.osdr.nasa.gov | Open science dataset profiles |
| `/ssc` | sscweb.gsfc.nasa.gov | Observatory coverage and orbit tracks |
| `/ssd-cneos` | ssd-api.jpl.nasa.gov | JPL close-approach data |
| `/techport` | techport.nasa.gov | NASA technology project portfolio |
| `/techtransfer` | technology.nasa.gov | Patents, software, and spinoffs |
| `/tle` | tle.ivanstanojevic.me | Two-line element records |
| `/trek` | trek.nasa.gov | Planetary Trek maps (Moon, Mars, Vesta) |

## Stack

- Next.js App Router
- React 19
- Tailwind CSS 4
- TypeScript

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
