export type NasaApiStatus = "live" | "placeholder";

export type NasaApiRecord = {
  docsUrl?: string;
  plannedFeatures: string[];
  slug: string;
  source: string;
  status: NasaApiStatus;
  summary: string;
  title: string;
};

export const nasaApiCatalog: NasaApiRecord[] = [
  {
    slug: "apod",
    title: "APOD",
    source: "api.nasa.gov",
    status: "live",
    summary: "Astronomy Picture of the Day with daily context and weekly comparison.",
    plannedFeatures: [
      "Date navigation and weekly strip are already live.",
      "Natural next step: save and compare themed runs over longer time windows.",
    ],
  },
  {
    slug: "eonet",
    title: "EONET",
    source: "eonet.gsfc.nasa.gov",
    status: "live",
    summary: "Open natural events with category filtering and coordinate plotting.",
    plannedFeatures: [
      "Coordinate plot and filtered event table are already live.",
      "Natural next step: time-series playback for moving storm tracks.",
    ],
  },
  {
    slug: "donki",
    title: "DONKI",
    source: "api.nasa.gov",
    status: "live",
    summary: "Space weather events aligned on one operational timeline.",
    plannedFeatures: [
      "Flare, CME, and geomagnetic storm views are already live.",
      "Natural next step: linked-event chains between flares and associated CMEs.",
    ],
  },
  {
    slug: "images",
    title: "NASA Image and Video Library",
    source: "images-api.nasa.gov",
    status: "live",
    summary: "Search NASA media by topic with useful thumbnails and metadata.",
    plannedFeatures: [
      "Search, result thumbnails, and direct asset links are live.",
      "Natural next step: detail pages with asset manifests and download variants.",
    ],
  },
  {
    slug: "neows",
    title: "Asteroids NeoWs",
    source: "api.nasa.gov",
    status: "live",
    summary: "Near-Earth object feed focused on closest and riskiest approaches.",
    plannedFeatures: [
      "Approach summaries and closest-pass comparison are live.",
      "Natural next step: orbit previews and date-range comparisons.",
    ],
  },
  {
    slug: "exoplanet",
    title: "Exoplanet Archive",
    source: "exoplanetarchive.ipac.caltech.edu",
    status: "live",
    summary: "Recent exoplanet discoveries and compact method breakdowns.",
    plannedFeatures: [
      "Recent discoveries and discovery-method distribution are live.",
      "Natural next step: host star drilldowns and radius-mass filtering.",
    ],
  },
  {
    slug: "epic",
    title: "EPIC",
    source: "api.nasa.gov",
    status: "live",
    summary: "Daily DSCOVR Earth imagery with frame selection and quick orbit context.",
    plannedFeatures: [
      "Daily frame reel and centroid/orbit readouts are live.",
      "Natural next step: multi-day timelapse and hemisphere change detection.",
    ],
  },
  {
    slug: "gibs",
    title: "GIBS",
    source: "api.nasa.gov / earthdata",
    status: "live",
    summary: "Curated global imagery layers with whole-Earth previews and NASA WMTS context.",
    plannedFeatures: [
      "Curated true-color and aerosol layer previews are live.",
      "Natural next step: date scrubbing and regional crop exploration.",
    ],
  },
  {
    slug: "insight",
    title: "Insight",
    source: "api.nasa.gov (archive)",
    status: "live",
    summary: "Final published InSight Mars weather archive with sol trends and station readings.",
    plannedFeatures: [
      "Final seven-sol weather board and trend sparklines are live.",
      "Natural next step: longer historical comparison if a fuller archive becomes available.",
    ],
  },
  {
    slug: "osdr",
    title: "Open Science Data Repository",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "Open science datasets better suited to searchable dataset views than media cards.",
    plannedFeatures: [
      "Dataset browser by subject, mission, and file format.",
      "Download and citation panel for dataset handoff.",
    ],
  },
  {
    slug: "ssc",
    title: "Satellite Situation Center",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "Satellite position and environment data with a strong orbit-view use case.",
    plannedFeatures: [
      "Orbit track overview for selected missions.",
      "Position and timestamp inspector for mission ops style lookups.",
    ],
  },
  {
    slug: "ssd-cneos",
    title: "SSD/CNEOS",
    source: "api.nasa.gov / JPL",
    status: "placeholder",
    summary: "Solar System Dynamics and CNEOS data beyond the simpler NeoWs feed.",
    plannedFeatures: [
      "Higher-detail small-body drilldowns than the current NeoWs page.",
      "Close-approach and orbital parameter comparison workspace.",
    ],
  },
  {
    slug: "techport",
    title: "Techport",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "NASA project and technology program data that wants a portfolio view.",
    plannedFeatures: [
      "Project portfolio browser with center, mission area, and year filters.",
      "Relationship view between projects, programs, and outcomes.",
    ],
  },
  {
    slug: "techtransfer",
    title: "TechTransfer",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "Patents, software, and transfer records with strong product-discovery potential.",
    plannedFeatures: [
      "Search by technology domain and patent status.",
      "Readable patent and software brief cards for scanning.",
    ],
  },
  {
    slug: "tle",
    title: "TLE API",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "Two-line element records for orbiting objects, best surfaced as trackable state.",
    plannedFeatures: [
      "Object lookup with latest orbital elements and epoch freshness.",
      "Compact pass prediction or orbital decay watchlist.",
    ],
  },
  {
    slug: "trek",
    title: "Vesta / Moon / Mars Trek WMTS",
    source: "api.nasa.gov",
    status: "placeholder",
    summary: "Planetary map tiles and layers suited to a proper planetary map viewer.",
    plannedFeatures: [
      "Terrain and mosaic layer browser for Moon, Mars, and Vesta.",
      "Coordinate readout and quick layer switching for exploration.",
    ],
  },
];

export function getBuiltApis() {
  return nasaApiCatalog.filter((api) => api.status === "live");
}

export function getPlaceholderApis() {
  return nasaApiCatalog.filter((api) => api.status === "placeholder");
}

export function getApiBySlug(slug: string) {
  return nasaApiCatalog.find((api) => api.slug === slug);
}
