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
    source: "visualization.osdr.nasa.gov",
    status: "live",
    summary: "Open science dataset metadata surfaced as a mission-and-assay handoff for a real accession.",
    plannedFeatures: [
      "OSD-48 mission and assay profile is already live.",
      "Natural next step: broaden from one accession to a searchable dataset browser.",
    ],
  },
  {
    slug: "ssc",
    title: "Satellite Situation Center",
    source: "sscweb.gsfc.nasa.gov",
    status: "live",
    summary: "Featured observatory coverage with a paired GSE orbit-track view instead of raw SSC output.",
    plannedFeatures: [
      "Observatory shortlist and THEMIS paired-track view are already live.",
      "Natural next step: let users switch mission pairs and coordinate systems.",
    ],
  },
  {
    slug: "ssd-cneos",
    title: "SSD/CNEOS",
    source: "ssd-api.jpl.nasa.gov",
    status: "live",
    summary: "JPL close-approach data beyond NeoWs, ranked and reformatted for quick scanning.",
    plannedFeatures: [
      "Upcoming close approaches with AU and lunar-distance comparisons are already live.",
      "Natural next step: add deeper orbital drilldowns for a selected object.",
    ],
  },
  {
    slug: "techport",
    title: "Techport",
    source: "techport.nasa.gov",
    status: "live",
    summary: "Recently updated NASA technology projects arranged as a browsable portfolio.",
    plannedFeatures: [
      "Recent project shortlist and selected-project spotlight are already live.",
      "Natural next step: center, program, and status filters across a larger portfolio.",
    ],
  },
  {
    slug: "techtransfer",
    title: "TechTransfer",
    source: "technology.nasa.gov",
    status: "live",
    summary: "Patents, software, and spinoffs normalized into readable technology cards.",
    plannedFeatures: [
      "Patent, software, and spinoff result cards are already live.",
      "Natural next step: richer filters for center, domain, and release status.",
    ],
  },
  {
    slug: "tle",
    title: "TLE API",
    source: "tle.ivanstanojevic.me",
    status: "live",
    summary: "Fresh two-line element records for a selected search term with latest epochs surfaced first.",
    plannedFeatures: [
      "Search-based TLE watchlist and freshest line pair are already live.",
      "Natural next step: compare epochs over time or add pass-planning helpers.",
    ],
  },
  {
    slug: "trek",
    title: "Vesta / Moon / Mars Trek WMTS",
    source: "trek.nasa.gov",
    status: "live",
    summary: "NASA's planetary Trek portals collected into one browser-map handoff for Moon, Mars, and Vesta.",
    plannedFeatures: [
      "Moon, Mars, and Vesta Trek portal handoffs are already live.",
      "Natural next step: deeper layer-by-layer previews if stable capabilities endpoints are exposed.",
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
