const NASA_API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY";
const NASA_API_BASE = "https://api.nasa.gov";
const EONET_API_BASE = "https://eonet.gsfc.nasa.gov/api/v3";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type ApodEntry = {
  copyright?: string;
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  service_version: string;
  thumbnail_url?: string;
  title: string;
  url: string;
};

type NasaImagesResponse = {
  collection: {
    items?: Array<{
      data?: Array<{
        date_created?: string;
        description?: string;
        media_type?: string;
        nasa_id?: string;
        title?: string;
      }>;
      href?: string;
      links?: Array<{
        href?: string;
        rel?: string;
        render?: string;
      }>;
    }>;
    metadata?: {
      total_hits?: number;
    };
  };
};

export type NasaImageSearchItem = {
  dateCreated: string | null;
  description: string | null;
  mediaType: string | null;
  nasaId: string | null;
  previewUrl: string | null;
  title: string;
};

export type NeoWsApproach = {
  absoluteMagnitude: number;
  estimatedDiameterMaxMeters: number | null;
  hazardous: boolean;
  id: string;
  lunarDistance: number;
  missDistanceKm: number;
  name: string;
  relativeVelocityKps: number;
};

type NeoWsFeedResponse = {
  element_count: number;
  near_earth_objects: Record<
    string,
    Array<{
      absolute_magnitude_h: number;
      estimated_diameter?: {
        meters?: {
          estimated_diameter_max?: number;
        };
      };
      id: string;
      is_potentially_hazardous_asteroid: boolean;
      name: string;
      close_approach_data?: Array<{
        miss_distance?: {
          kilometers?: string;
          lunar?: string;
        };
        relative_velocity?: {
          kilometers_per_second?: string;
        };
      }>;
    }>
  >;
};

type ExoplanetRecord = {
  disc_year: number | null;
  discoverymethod: string | null;
  hostname: string | null;
  pl_bmasse: number | null;
  pl_name: string;
  pl_rade: number | null;
  sy_dist: number | null;
};

export type ExoplanetView = {
  discoveryMethod: string;
  discoveryYear: number | null;
  hostName: string;
  massEarths: number | null;
  name: string;
  radiusEarths: number | null;
  systemDistanceParsecs: number | null;
};

type EonetCategory = {
  id: string;
  title: string;
};

type EonetSource = {
  id: string;
  url: string;
};

type EonetGeometry = {
  coordinates: unknown;
  date: string;
  magnitudeUnit?: string | null;
  magnitudeValue?: number | null;
  type: string;
};

type EonetEvent = {
  categories: EonetCategory[];
  closed?: string | null;
  description?: string | null;
  geometry: EonetGeometry[];
  id: string;
  links?: { href: string; rel?: string; title?: string }[];
  sources: EonetSource[];
  title: string;
};

type EonetEventsResponse = {
  events: EonetEvent[];
};

export type EonetEventView = {
  categoryIds: string[];
  categoryLabel: string;
  coordinates: { latitude: number; longitude: number } | null;
  description: string | null;
  id: string;
  latestDate: string;
  sourceCount: number;
  sources: EonetSource[];
  title: string;
};

type DonkiLinkedEvent = {
  activityID?: string | null;
};

type DonkiFlare = {
  activeRegionNum?: number | null;
  beginTime: string;
  classType: string;
  endTime?: string | null;
  flrID: string;
  linkedEvents?: DonkiLinkedEvent[];
  peakTime?: string | null;
  sourceLocation?: string | null;
};

type DonkiCmeAnalysis = {
  halfAngle?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  speed?: number | null;
  type?: string | null;
};

type DonkiCme = {
  activityID: string;
  cmeAnalyses?: DonkiCmeAnalysis[];
  note?: string | null;
  startTime: string;
};

type DonkiKp = {
  kpIndex: number;
  observedTime: string;
  source: string;
};

type DonkiGst = {
  allKpIndex: DonkiKp[];
  gstID: string;
  startTime: string;
};

export type DonkiFlareView = {
  activeRegion: string;
  beginTime: string;
  classType: string;
  id: string;
  linkedEventCount: number;
  peakTime: string | null;
  sourceLocation: string | null;
};

export type DonkiCmeView = {
  halfAngle: number | null;
  id: string;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  speed: number | null;
  startTime: string;
  type: string | null;
};

export type DonkiGstView = {
  id: string;
  maxKpIndex: number | null;
  readings: DonkiKp[];
  startTime: string;
};

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildApiUrl(baseUrl: string, params: Record<string, string | undefined>) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function shouldRetryRequest(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, revalidate = 3600, retries = 1) {
  let attempt = 0;
  let lastStatus: number | null = null;

  while (attempt <= retries) {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    lastStatus = response.status;

    if (attempt === retries || !shouldRetryRequest(response.status)) {
      throw new Error(`NASA request failed with status ${response.status}.`);
    }

    await delay(350 * (attempt + 1));
    attempt += 1;
  }

  throw new Error(`NASA request failed with status ${lastStatus ?? 500}.`);
}

export function getRecentDateRange(endDateInput?: string, dayCount = 7) {
  const endDate = endDateInput ? new Date(`${endDateInput}T00:00:00Z`) : new Date();
  const safeEndDate = Number.isNaN(endDate.getTime()) ? new Date() : endDate;
  const startDate = new Date(safeEndDate.getTime() - (dayCount - 1) * DAY_IN_MS);

  return {
    startDate: formatDateOnly(startDate),
    endDate: formatDateOnly(safeEndDate),
  };
}

export async function getApod(date?: string) {
  const url = buildApiUrl(`${NASA_API_BASE}/planetary/apod`, {
    api_key: NASA_API_KEY,
    date,
    thumbs: "true",
  });

  return fetchJson<ApodEntry>(url, 3600);
}

export async function getApodRange(endDate?: string, dayCount = 7) {
  const { startDate, endDate: resolvedEndDate } = getRecentDateRange(endDate, dayCount);
  const url = buildApiUrl(`${NASA_API_BASE}/planetary/apod`, {
    api_key: NASA_API_KEY,
    start_date: startDate,
    end_date: resolvedEndDate,
    thumbs: "true",
  });

  const entries = await fetchJson<ApodEntry[]>(url, 3600);
  return entries.sort((left, right) => right.date.localeCompare(left.date));
}

export async function searchNasaImages(query = "moon", pageSize = 12) {
  const url = buildApiUrl("https://images-api.nasa.gov/search", {
    media_type: "image",
    page_size: String(pageSize),
    q: query,
  });

  const payload = await fetchJson<NasaImagesResponse>(url, 1800);

  return {
    items:
      payload.collection.items?.map((item) => ({
        dateCreated: item.data?.[0]?.date_created ?? null,
        description: item.data?.[0]?.description ?? null,
        mediaType: item.data?.[0]?.media_type ?? null,
        nasaId: item.data?.[0]?.nasa_id ?? null,
        previewUrl: item.links?.find((link) => link.render === "image")?.href ?? null,
        title: item.data?.[0]?.title ?? "Untitled NASA asset",
      })) ?? [],
    totalHits: payload.collection.metadata?.total_hits ?? 0,
  };
}

export async function getNeoFeed(dayCount = 2) {
  const { startDate, endDate } = getRecentDateRange(undefined, dayCount);
  const url = buildApiUrl(`${NASA_API_BASE}/neo/rest/v1/feed`, {
    api_key: NASA_API_KEY,
    end_date: endDate,
    start_date: startDate,
  });

  const payload = await fetchJson<NeoWsFeedResponse>(url, 1800);
  const objects = Object.values(payload.near_earth_objects)
    .flat()
    .map((object) => {
      const approach = object.close_approach_data?.[0];

      return {
        absoluteMagnitude: object.absolute_magnitude_h,
        estimatedDiameterMaxMeters:
          object.estimated_diameter?.meters?.estimated_diameter_max ?? null,
        hazardous: object.is_potentially_hazardous_asteroid,
        id: object.id,
        lunarDistance: Number.parseFloat(approach?.miss_distance?.lunar ?? "0"),
        missDistanceKm: Number.parseFloat(approach?.miss_distance?.kilometers ?? "0"),
        name: object.name,
        relativeVelocityKps: Number.parseFloat(
          approach?.relative_velocity?.kilometers_per_second ?? "0",
        ),
      };
    })
    .sort((left, right) => left.lunarDistance - right.lunarDistance);

  return {
    approaches: objects satisfies NeoWsApproach[],
    elementCount: payload.element_count,
    range: { startDate, endDate },
  };
}

function flattenCoordinates(input: unknown): [number, number][] {
  if (!Array.isArray(input)) {
    return [];
  }

  if (
    input.length >= 2 &&
    typeof input[0] === "number" &&
    typeof input[1] === "number"
  ) {
    return [[input[0], input[1]]];
  }

  return input.flatMap((entry) => flattenCoordinates(entry));
}

function getGeometryCenter(geometry: EonetGeometry[]): { latitude: number; longitude: number } | null {
  const latest = geometry.at(-1);

  if (!latest) {
    return null;
  }

  const points = flattenCoordinates(latest.coordinates);

  if (!points.length) {
    return null;
  }

  const longitude =
    points.reduce((total, [value]) => total + value, 0) / points.length;
  const latitude =
    points.reduce((total, [, value]) => total + value, 0) / points.length;

  return { latitude, longitude };
}

export async function getEonetEvents() {
  const url = buildApiUrl(`${EONET_API_BASE}/events`, {
    status: "open",
    limit: "100",
  });

  const payload = await fetchJson<EonetEventsResponse>(url, 1800);

  return payload.events.map((event) => ({
    categoryIds: event.categories.map((category) => category.id),
    categoryLabel: event.categories.map((category) => category.title).join(", "),
    coordinates: getGeometryCenter(event.geometry),
    description: event.description ?? null,
    id: event.id,
    latestDate: event.geometry.at(-1)?.date ?? "",
    sourceCount: event.sources.length,
    sources: event.sources,
    title: event.title,
  })) satisfies EonetEventView[];
}

function getStrongestCmeAnalysis(analyses: DonkiCmeAnalysis[] | undefined) {
  if (!analyses?.length) {
    return null;
  }

  return [...analyses].sort(
    (left, right) => (right.speed ?? -1) - (left.speed ?? -1),
  )[0];
}

export async function getDonkiSummary(windowDays = 14) {
  const endDate = formatDateOnly(new Date());
  const startDate = formatDateOnly(new Date(Date.now() - (windowDays - 1) * DAY_IN_MS));

  const [flares, cmes, storms] = await Promise.all([
    fetchJson<DonkiFlare[]>(
      buildApiUrl(`${NASA_API_BASE}/DONKI/FLR`, {
        api_key: NASA_API_KEY,
        endDate,
        startDate,
      }),
      1800,
    ),
    fetchJson<DonkiCme[]>(
      buildApiUrl(`${NASA_API_BASE}/DONKI/CME`, {
        api_key: NASA_API_KEY,
        endDate,
        startDate,
      }),
      1800,
    ),
    fetchJson<DonkiGst[]>(
      buildApiUrl(`${NASA_API_BASE}/DONKI/GST`, {
        api_key: NASA_API_KEY,
        endDate,
        startDate,
      }),
      1800,
    ),
  ]);

  const flareViews = flares
    .map((flare) => ({
      activeRegion:
        flare.activeRegionNum === null || flare.activeRegionNum === undefined
          ? "Unnumbered"
          : `AR ${flare.activeRegionNum}`,
      beginTime: flare.beginTime,
      classType: flare.classType,
      id: flare.flrID,
      linkedEventCount: flare.linkedEvents?.length ?? 0,
      peakTime: flare.peakTime ?? null,
      sourceLocation: flare.sourceLocation ?? null,
    }))
    .sort((left, right) => right.beginTime.localeCompare(left.beginTime));

  const cmeViews = cmes
    .map((cme) => {
      const analysis = getStrongestCmeAnalysis(cme.cmeAnalyses);

      return {
        halfAngle: analysis?.halfAngle ?? null,
        id: cme.activityID,
        latitude: analysis?.latitude ?? null,
        longitude: analysis?.longitude ?? null,
        note: cme.note ?? null,
        speed: analysis?.speed ?? null,
        startTime: cme.startTime,
        type: analysis?.type ?? null,
      };
    })
    .sort((left, right) => right.startTime.localeCompare(left.startTime));

  const stormViews = storms
    .map((storm) => ({
      id: storm.gstID,
      maxKpIndex:
        storm.allKpIndex.length > 0
          ? Math.max(...storm.allKpIndex.map((reading) => reading.kpIndex))
          : null,
      readings: storm.allKpIndex,
      startTime: storm.startTime,
    }))
    .sort((left, right) => right.startTime.localeCompare(left.startTime));

  return {
    cmes: cmeViews satisfies DonkiCmeView[],
    flares: flareViews satisfies DonkiFlareView[],
    range: { endDate, startDate, windowDays },
    storms: stormViews satisfies DonkiGstView[],
  };
}

function buildTapUrl(query: string) {
  return buildApiUrl("https://exoplanetarchive.ipac.caltech.edu/TAP/sync", {
    format: "json",
    query,
  });
}

function normalizeExoplanet(record: ExoplanetRecord): ExoplanetView {
  return {
    discoveryMethod: record.discoverymethod ?? "Unknown",
    discoveryYear: record.disc_year ?? null,
    hostName: record.hostname ?? "Unknown host",
    massEarths: record.pl_bmasse ?? null,
    name: record.pl_name,
    radiusEarths: record.pl_rade ?? null,
    systemDistanceParsecs: record.sy_dist ?? null,
  };
}

export async function getExoplanetSnapshot() {
  const recentQuery =
    "select top 24 pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist from pscomppars where disc_year is not null order by disc_year desc";
  const nearestQuery =
    "select top 12 pl_name,hostname,discoverymethod,disc_year,pl_rade,pl_bmasse,sy_dist from pscomppars where sy_dist is not null order by sy_dist asc";

  const [recent, nearest] = await Promise.all([
    fetchJson<ExoplanetRecord[]>(buildTapUrl(recentQuery), 1800),
    fetchJson<ExoplanetRecord[]>(buildTapUrl(nearestQuery), 1800),
  ]);

  const recentPlanets = recent.map(normalizeExoplanet);
  const nearestPlanets = nearest.map(normalizeExoplanet);

  const methodCounts = [...recentPlanets.reduce((counts, planet) => {
    counts.set(planet.discoveryMethod, (counts.get(planet.discoveryMethod) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()).entries()]
    .map(([method, count]) => ({ count, method }))
    .sort((left, right) => right.count - left.count);

  return {
    methodCounts,
    nearestPlanets,
    recentPlanets,
  };
}
