const REQUEST_TIMEOUT_MS = 8000;
const AU_TO_LUNAR_DISTANCE = 389.174;

type FetchOptions = {
  accept?: string;
  revalidate?: number;
  retries?: number;
};

type OsdrDatasetPayload = {
  REST_URL?: string;
  assays?: Array<Record<string, unknown>>;
  files?: {
    REST_URL?: string;
  };
  metadata?: Record<string, unknown>;
};

type TechportListResponse = {
  projects?: Array<{
    detailedFunding?: boolean;
    favorited?: boolean;
    lastUpdated?: string;
    projectId?: number;
  }>;
};

type TechportDetailResponse = {
  project?: {
    benefits?: string | null;
    description?: string | null;
    endDateString?: string | null;
    leadOrganization?: {
      organizationName?: string | null;
    };
    lastUpdated?: string | null;
    program?: {
      acronym?: string | null;
      title?: string | null;
    };
    projectId?: number;
    startDateString?: string | null;
    status?: string | null;
    title?: string | null;
  };
};

type TechTransferResponse = {
  count?: number;
  results?: unknown[][];
  total?: number;
};

type TleResponse = {
  member?: Array<{
    date?: string;
    line1?: string;
    line2?: string;
    name?: string;
    satelliteId?: number;
  }>;
  totalItems?: number;
};

type SsdCadResponse = {
  count?: number;
  data?: string[][];
  fields?: string[];
};

export type OsdrSnapshot = {
  accession: string;
  assayCount: number;
  assayMeasurementTypes: string[];
  assayTechnologyTypes: string[];
  datasetUrl: string;
  filesUrl: string | null;
  missionEnd: string | null;
  missionName: string | null;
  missionStart: string | null;
  organism: string | null;
  platform: string | null;
  projectTitle: string;
  studyTitle: string | null;
  thumbnailUrl: string | null;
};

export type SscObservatoryView = {
  endTime: string | null;
  id: string;
  name: string;
  resolutionSeconds: number | null;
  startTime: string | null;
};

export type SscTrackPoint = {
  time: string;
  x: number;
  y: number;
  z: number;
};

export type SscTrackView = {
  coordinateSystem: string;
  endDistanceKm: number | null;
  endTime: string | null;
  id: string;
  name: string;
  points: SscTrackPoint[];
  sampleCount: number;
  startDistanceKm: number | null;
  startTime: string | null;
};

export type SscSnapshot = {
  featuredObservatories: SscObservatoryView[];
  pairLabel: string;
  queryWindowEnd: string | null;
  queryWindowStart: string | null;
  tracks: SscTrackView[];
};

export type SsdCneosApproachView = {
  approachDate: string;
  designation: string;
  distanceAu: number | null;
  distanceLunar: number | null;
  hMagnitude: number | null;
  missDistanceRangeAu: string | null;
  orbitId: string | null;
  relativeVelocityKps: number | null;
};

export type SsdCneosSnapshot = {
  approaches: SsdCneosApproachView[];
  queryWindowEnd: string;
  queryWindowStart: string;
};

export type TechportProjectView = {
  benefits: string | null;
  center: string | null;
  description: string | null;
  id: number;
  lastUpdated: string | null;
  program: string | null;
  status: string | null;
  timeWindow: string | null;
  title: string;
};

export type TechportSnapshot = {
  projects: TechportProjectView[];
  updatedSince: string;
};

export type TechTransferCategory = "patent" | "software" | "spinoff";

export type TechTransferItemView = {
  caseNumber: string | null;
  center: string | null;
  description: string;
  id: string;
  imageUrl: string | null;
  score: number | null;
  status: string | null;
  tags: string | null;
  title: string;
};

export type TechTransferSnapshot = {
  category: TechTransferCategory;
  endpoint: string;
  query: string;
  results: TechTransferItemView[];
  total: number;
};

export type TleRecordView = {
  ageHours: number;
  date: string;
  line1: string;
  line2: string;
  name: string;
  satelliteId: number;
};

export type TleSnapshot = {
  query: string;
  records: TleRecordView[];
  totalItems: number;
};

export type TrekDestinationView = {
  description: string;
  focus: string;
  layers: string[];
  title: string;
  url: string;
};

const TREK_DESTINATIONS: TrekDestinationView[] = [
  {
    title: "Moon Trek",
    focus: "Lunar geology, landing regions, traverse planning, and naming layers.",
    description:
      "NASA's lunar Trek portal bundles imagery, elevation, geologic overlays, and measurement tools into one browser map.",
    layers: ["Global mosaics", "Topography", "Named features"],
    url: "https://trek.nasa.gov/moon/",
  },
  {
    title: "Mars Trek",
    focus: "Orbital mosaics, elevation, landing-site context, and mission planning overlays.",
    description:
      "Mars Trek is the practical handoff when you need a real planetary map instead of a raw WMTS capability document.",
    layers: ["Basemaps", "Elevation", "Mission context"],
    url: "https://trek.nasa.gov/mars/",
  },
  {
    title: "Vesta Trek",
    focus: "Minor-planet basemaps and exploratory layer switching for the Dawn mission archive.",
    description:
      "Vesta Trek extends the same interface pattern to a smaller target, which makes the Trek family easier to compare side by side.",
    layers: ["Color mosaics", "Terrain context", "Feature lookup"],
    url: "https://trek.nasa.gov/vesta/",
  },
];

function shouldRetryRequest(status: number) {
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function shouldRetryError(error: unknown) {
  return error instanceof Error && (error.name === "AbortError" || error.name === "TypeError");
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, options: FetchOptions = {}) {
  const { accept = "application/json", revalidate = 3600, retries = 1 } = options;
  let attempt = 0;
  let lastStatus: number | null = null;
  let lastError: unknown = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        cache: "force-cache",
        headers: { accept },
        next: { revalidate },
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as T;
      }

      lastStatus = response.status;

      if (attempt === retries || !shouldRetryRequest(response.status)) {
        throw new Error(`Request failed with status ${response.status}.`);
      }
    } catch (error) {
      lastError = error;

      if (attempt === retries || !shouldRetryError(error)) {
        throw error;
      }
    } finally {
      clearTimeout(timeoutId);
    }

    await delay(350 * (attempt + 1));
    attempt += 1;
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(`Request failed with status ${lastStatus ?? 500}.`);
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return [value.trim()].filter(Boolean);
  }

  return [];
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatSscDate(date: Date) {
  return date
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(/\.\d{3}Z$/, "Z");
}

function parseOptionalNumber(value: string | undefined) {
  if (!value) {
    return null;
  }

  const numeric = Number.parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function stripTags(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&apos;", "'")
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&nbsp;", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unwrapSscNode<T>(value: unknown): T | null {
  if (Array.isArray(value) && value.length >= 2) {
    return value[1] as T;
  }

  if (value && typeof value === "object") {
    return value as T;
  }

  return null;
}

function unwrapSscList<T>(value: unknown) {
  const unwrapped = unwrapSscNode<unknown>(value);

  if (!Array.isArray(unwrapped)) {
    return [] as T[];
  }

  return unwrapped
    .map((entry) => unwrapSscNode<T>(entry))
    .filter((entry): entry is T => entry !== null);
}

function parseSscDateValue(value: unknown) {
  if (Array.isArray(value) && value.length >= 2 && typeof value[1] === "string") {
    return value[1];
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function parseSscNumbers(value: unknown) {
  const unwrapped = unwrapSscNode<unknown>(value);

  if (!Array.isArray(unwrapped)) {
    return [] as number[];
  }

  return unwrapped
    .map((entry) => (typeof entry === "number" ? entry : Number.NaN))
    .filter((entry) => Number.isFinite(entry));
}

function parseSscTimes(value: unknown) {
  const unwrapped = unwrapSscNode<unknown>(value);

  if (!Array.isArray(unwrapped)) {
    return [] as string[];
  }

  return unwrapped
    .map((entry) => parseSscDateValue(entry))
    .filter((entry): entry is string => Boolean(entry));
}

function sortByTargetOrder<T extends { id: string }>(items: T[], ids: string[]) {
  return [...items].sort((left, right) => ids.indexOf(left.id) - ids.indexOf(right.id));
}

export async function getOsdrSnapshot() {
  const datasetUrl = "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-48/?format=json";
  const payload = await fetchJson<Record<string, OsdrDatasetPayload>>(datasetUrl);
  const [accession, dataset] = Object.entries(payload)[0] ?? [];

  if (!accession || !dataset) {
    throw new Error("OSDR dataset payload was empty.");
  }

  const metadata = dataset.metadata ?? {};
  const mission =
    typeof metadata.mission === "object" && metadata.mission !== null
      ? (metadata.mission as Record<string, unknown>)
      : null;
  const thumbnailPath = typeof metadata.thumbnail === "string" ? metadata.thumbnail : null;

  return {
    accession,
    assayCount: Array.isArray(dataset.assays) ? dataset.assays.length : 0,
    assayMeasurementTypes: normalizeList(metadata["study assay measurement type"]),
    assayTechnologyTypes: normalizeList(metadata["study assay technology type"]),
    datasetUrl,
    filesUrl: dataset.files?.REST_URL ?? null,
    missionEnd: typeof mission?.["end date"] === "string" ? mission["end date"] : null,
    missionName: typeof mission?.name === "string" ? mission.name : null,
    missionStart: typeof mission?.["start date"] === "string" ? mission["start date"] : null,
    organism: typeof metadata.organism === "string" ? metadata.organism : null,
    platform: typeof metadata["experiment platform"] === "string" ? metadata["experiment platform"] : null,
    projectTitle:
      typeof metadata["project title"] === "string" ? metadata["project title"] : accession,
    studyTitle: typeof metadata["study title"] === "string" ? metadata["study title"] : null,
    thumbnailUrl: thumbnailPath ? `https://visualization.osdr.nasa.gov${thumbnailPath}` : null,
  } satisfies OsdrSnapshot;
}

export async function getSscSnapshot() {
  const observatoryUrl = "https://sscweb.gsfc.nasa.gov/WS/sscr/2/observatories/";
  const observatoryPayload = await fetchJson<unknown>(observatoryUrl);
  const observatoryRoot = unwrapSscNode<{ Observatory?: unknown }>(observatoryPayload);
  const observatories = unwrapSscList<{
    EndTime?: unknown;
    Id?: string;
    Name?: string;
    Resolution?: number;
    StartTime?: unknown;
  }>(observatoryRoot?.Observatory).map((observatory) => ({
    endTime: parseSscDateValue(observatory.EndTime),
    id: observatory.Id ?? "unknown",
    name: observatory.Name ?? observatory.Id ?? "Unnamed observatory",
    resolutionSeconds:
      typeof observatory.Resolution === "number" ? observatory.Resolution : null,
    startTime: parseSscDateValue(observatory.StartTime),
  })) satisfies SscObservatoryView[];

  const featuredIds = ["ace", "parkersp", "themisa", "themisb", "voyager1"];
  const featuredObservatories = sortByTargetOrder(
    observatories.filter((item) => featuredIds.includes(item.id)),
    featuredIds,
  );
  const pairedIds = ["themisa", "themisb"];
  const pairedObservatories = sortByTargetOrder(
    featuredObservatories.filter((item) => pairedIds.includes(item.id)),
    pairedIds,
  );

  if (pairedObservatories.length < 2) {
    return {
      featuredObservatories,
      pairLabel: "No paired observatories available",
      queryWindowEnd: null,
      queryWindowStart: null,
      tracks: [],
    } satisfies SscSnapshot;
  }

  const endTimeMs = Math.min(
    ...pairedObservatories.map((item) => new Date(item.endTime ?? Date.now()).getTime()),
  );
  const safeEndTime = Number.isFinite(endTimeMs) ? new Date(endTimeMs) : new Date();
  const safeStartTime = new Date(safeEndTime.getTime() - 6 * 60 * 60 * 1000);
  const trackUrl = `https://sscweb.gsfc.nasa.gov/WS/sscr/2/locations/${pairedObservatories
    .map((item) => item.id)
    .join(",")}/${formatSscDate(safeStartTime)},${formatSscDate(safeEndTime)}/gse/`;
  const trackPayload = await fetchJson<unknown>(trackUrl);
  const trackRoot = unwrapSscNode<{ Result?: unknown }>(trackPayload);
  const result = unwrapSscNode<{ Data?: unknown }>(trackRoot?.Result);
  const tracks = unwrapSscList<{
    Coordinates?: unknown;
    Id?: string;
    Time?: unknown;
  }>(result?.Data).map((track) => {
    const coordinateSeries = unwrapSscList<{
      CoordinateSystem?: string;
      X?: unknown;
      Y?: unknown;
      Z?: unknown;
    }>(track.Coordinates)[0];
    const x = parseSscNumbers(coordinateSeries?.X);
    const y = parseSscNumbers(coordinateSeries?.Y);
    const z = parseSscNumbers(coordinateSeries?.Z);
    const times = parseSscTimes(track.Time);
    const length = Math.min(x.length, y.length, z.length, times.length);
    const points = Array.from({ length }, (_, index) => ({
      time: times[index],
      x: x[index],
      y: y[index],
      z: z[index],
    })) satisfies SscTrackPoint[];
    const start = points[0];
    const end = points.at(-1);
    const observatory = featuredObservatories.find((item) => item.id === track.Id);

    return {
      coordinateSystem: coordinateSeries?.CoordinateSystem ?? "GSE",
      endDistanceKm: end ? Math.hypot(end.x, end.y, end.z) : null,
      endTime: end?.time ?? null,
      id: track.Id ?? "unknown",
      name: observatory?.name ?? track.Id ?? "Unknown track",
      points,
      sampleCount: points.length,
      startDistanceKm: start ? Math.hypot(start.x, start.y, start.z) : null,
      startTime: start?.time ?? null,
    } satisfies SscTrackView;
  });

  return {
    featuredObservatories,
    pairLabel: pairedObservatories.map((item) => item.name).join(" / "),
    queryWindowEnd: safeEndTime.toISOString(),
    queryWindowStart: safeStartTime.toISOString(),
    tracks,
  } satisfies SscSnapshot;
}

export async function getSsdCneosSnapshot() {
  const queryWindowStart = formatDateOnly(new Date());
  const queryWindowEnd = formatDateOnly(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  );
  const url =
    "https://ssd-api.jpl.nasa.gov/cad.api?dist-max=0.05" +
    `&date-min=${queryWindowStart}&date-max=${queryWindowEnd}&sort=date&limit=12`;
  const payload = await fetchJson<SsdCadResponse>(url);
  const fields = payload.fields ?? [];
  const getField = (row: string[], field: string) => row[fields.indexOf(field)];

  return {
    approaches: (payload.data ?? []).map((row) => {
      const distanceAu = parseOptionalNumber(getField(row, "dist"));
      const minDistanceAu = parseOptionalNumber(getField(row, "dist_min"));
      const maxDistanceAu = parseOptionalNumber(getField(row, "dist_max"));

      return {
        approachDate: getField(row, "cd") ?? "Unknown date",
        designation: getField(row, "des") ?? "Unknown object",
        distanceAu,
        distanceLunar: distanceAu === null ? null : distanceAu * AU_TO_LUNAR_DISTANCE,
        hMagnitude: parseOptionalNumber(getField(row, "h")),
        missDistanceRangeAu:
          minDistanceAu !== null && maxDistanceAu !== null
            ? `${minDistanceAu.toFixed(5)} to ${maxDistanceAu.toFixed(5)} au`
            : null,
        orbitId: getField(row, "orbit_id") ?? null,
        relativeVelocityKps: parseOptionalNumber(getField(row, "v_rel")),
      } satisfies SsdCneosApproachView;
    }),
    queryWindowEnd,
    queryWindowStart,
  } satisfies SsdCneosSnapshot;
}

export async function getTechportSnapshot() {
  const updatedSince = formatDateOnly(
    new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
  );
  const listUrl = `https://techport.nasa.gov/api/projects?updatedSince=${updatedSince}`;
  const listPayload = await fetchJson<TechportListResponse>(listUrl);
  const recentProjects = [...(listPayload.projects ?? [])]
    .filter((project): project is { lastUpdated?: string; projectId: number } =>
      typeof project.projectId === "number",
    )
    .sort((left, right) => {
      const leftTime = new Date(left.lastUpdated ?? "").getTime();
      const rightTime = new Date(right.lastUpdated ?? "").getTime();
      return rightTime - leftTime;
    })
    .slice(0, 8);

  const projects = await Promise.all(
    recentProjects.map(async (project) => {
      const detailUrl = `https://techport.nasa.gov/api/projects/${project.projectId}`;

      try {
        const detailPayload = await fetchJson<TechportDetailResponse>(detailUrl);
        const detail = detailPayload.project;

        return {
          benefits: stripTags(detail?.benefits) ?? null,
          center: detail?.leadOrganization?.organizationName ?? null,
          description: stripTags(detail?.description) ?? null,
          id: project.projectId,
          lastUpdated: detail?.lastUpdated ?? project.lastUpdated ?? null,
          program: detail?.program?.title ?? detail?.program?.acronym ?? null,
          status: detail?.status ?? null,
          timeWindow:
            detail?.startDateString || detail?.endDateString
              ? `${detail?.startDateString ?? "Unknown start"} to ${detail?.endDateString ?? "Open"}`
              : null,
          title: detail?.title ?? `Project ${project.projectId}`,
        } satisfies TechportProjectView;
      } catch {
        return {
          benefits: null,
          center: null,
          description: null,
          id: project.projectId,
          lastUpdated: project.lastUpdated ?? null,
          program: null,
          status: null,
          timeWindow: null,
          title: `Project ${project.projectId}`,
        } satisfies TechportProjectView;
      }
    }),
  );

  return {
    projects,
    updatedSince,
  } satisfies TechportSnapshot;
}

export async function getTechTransferSnapshot(
  category: TechTransferCategory,
  query: string,
) {
  const safeQuery = query.trim() || "rocket";
  const endpoint = `https://technology.nasa.gov/api/api/${category}/${encodeURIComponent(safeQuery)}`;
  const payload = await fetchJson<TechTransferResponse>(endpoint);

  return {
    category,
    endpoint,
    query: safeQuery,
    results: (payload.results ?? []).map((row, index) => {
      const lastValue = row.at(-1);
      const score =
        typeof lastValue === "number"
          ? lastValue
          : typeof lastValue === "string"
            ? Number.parseFloat(lastValue)
            : null;

      return {
        caseNumber: typeof row[1] === "string" ? row[1] : null,
        center: typeof row[9] === "string" && row[9] ? row[9] : null,
        description:
          stripTags(typeof row[3] === "string" ? row[3] : null) ?? "No description listed.",
        id: typeof row[0] === "string" ? row[0] : `${category}-${safeQuery}-${index}`,
        imageUrl:
          typeof row[10] === "string" && row[10].startsWith("http") ? row[10] : null,
        score: score !== null && Number.isFinite(score) ? score : null,
        status: typeof row[6] === "string" && row[6] ? row[6] : null,
        tags: typeof row[5] === "string" && row[5] ? row[5] : null,
        title: stripTags(typeof row[2] === "string" ? row[2] : null) ?? "Untitled technology",
      } satisfies TechTransferItemView;
    }),
    total: payload.total ?? payload.count ?? 0,
  } satisfies TechTransferSnapshot;
}

export async function getTleSnapshot(query: string) {
  const safeQuery = query.trim() || "iss";
  const url = `https://tle.ivanstanojevic.me/api/tle/?search=${encodeURIComponent(safeQuery)}`;
  const payload = await fetchJson<TleResponse>(url);
  const records = [...(payload.member ?? [])]
    .filter(
      (record): record is Required<Pick<TleRecordView, "date" | "line1" | "line2" | "name" | "satelliteId">> =>
        typeof record.date === "string" &&
        typeof record.line1 === "string" &&
        typeof record.line2 === "string" &&
        typeof record.name === "string" &&
        typeof record.satelliteId === "number",
    )
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 10)
    .map((record) => ({
      ageHours: Math.max(
        0,
        Math.round((Date.now() - new Date(record.date).getTime()) / (1000 * 60 * 60)),
      ),
      date: record.date,
      line1: record.line1,
      line2: record.line2,
      name: record.name,
      satelliteId: record.satelliteId,
    })) satisfies TleRecordView[];

  return {
    query: safeQuery,
    records,
    totalItems: payload.totalItems ?? records.length,
  } satisfies TleSnapshot;
}

export function getTrekDestinations() {
  return TREK_DESTINATIONS;
}
