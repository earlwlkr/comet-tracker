const OBSERVABILITY_URL = "https://ssd-api.jpl.nasa.gov/sbwobs.api";
const SBDB_URL = "https://ssd-api.jpl.nasa.gov/sbdb.api";
const DEFAULT_OBSERVATORY_CODE = process.env.COMET_TRACKER_MPC_CODE ?? "F51";
const DEFAULT_MAX_COMETS = 6;

type ObservabilityResponse = {
  location?: string;
  obs_night?: Record<string, string>;
  data?: string[][];
};

type SbdbElement = {
  name?: string;
  value?: string | null;
  units?: string | null;
};

type SbdbPhysicalParameter = {
  name?: string;
  value?: string | null;
  units?: string | null;
};

type SbdbResponse = {
  object?: {
    des?: string;
    fullname?: string;
    orbit_class?: {
      name?: string;
    };
  };
  orbit?: {
    soln_date?: string | null;
    first_obs?: string | null;
    last_obs?: string | null;
    data_arc?: string | null;
    rms?: string | null;
    elements?: SbdbElement[];
  };
  phys_par?: SbdbPhysicalParameter[];
  ca_data?: unknown[];
};

export type TrackerAlert = {
  level: "High" | "Watch" | "Info";
  title: string;
  detail: string;
};

export type TrackerLogEntry = {
  time: string;
  title: string;
  detail: string;
  quality: string;
};

export type TrackerWindow = {
  label: string;
  time: string;
  duration: string;
  altitude: string;
  note: string;
};

export type TrackerSkyCondition = {
  label: string;
  value: string;
  note: string;
};

export type TrackerComet = {
  id: string;
  name: string;
  designation: string;
  status: string;
  accent: string;
  synopsis: string;
  orbitClass: string;
  period: string;
  perihelionDistance: string;
  topocentricRange: string;
  solarElongation: string;
  moonAngle: string;
  magnitude: string;
  rightAscension: string;
  declination: string;
  nextWindow: string;
  visibility: number;
  checklist: string[];
  windows: TrackerWindow[];
  log: TrackerLogEntry[];
  alerts: TrackerAlert[];
};

export type TrackerPayload = {
  generatedAt: string;
  observationDate: string;
  observatory: {
    code: string;
    name: string;
    beginDark: string;
    endDark: string;
    darkTime: string;
  };
  skyConditions: TrackerSkyCondition[];
  comets: TrackerComet[];
  source: {
    observabilityApi: string;
    sbdbApi: string;
  };
};

const accentPalette = ["#9BE7FF", "#FFD27A", "#8FFFC1", "#F6A6FF", "#FFAA88", "#C3D4FF"];

function buildUrl(baseUrl: string, params: Record<string, string>) {
  const url = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`JPL request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}

function getElementValue(elements: SbdbElement[] | undefined, name: string) {
  return elements?.find((element) => element.name === name)?.value ?? null;
}

function parseMagnitude(value: string) {
  return Number.parseFloat(value.replace(/[A-Z]/gi, ""));
}

function parseAngle(value: string) {
  return Number.parseFloat(value);
}

function parseObservableMinutes(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return 0;
  }

  return Number.parseInt(match[1], 10) * 60 + Number.parseInt(match[2], 10);
}

function cleanTime(value: string) {
  return value.replaceAll("*", "").trim();
}

function formatPeriod(periodDays: string | null, orbitClass: string) {
  if (!periodDays) {
    return orbitClass.toLowerCase().includes("hyperbolic") ? "Hyperbolic" : "Unlisted";
  }

  const days = Number.parseFloat(periodDays);

  if (!Number.isFinite(days)) {
    return orbitClass.toLowerCase().includes("hyperbolic") ? "Hyperbolic" : "Unlisted";
  }

  if (days >= 365) {
    return `${(days / 365.25).toFixed(1)} years`;
  }

  return `${Math.round(days)} days`;
}

function formatDistance(value: string | null) {
  if (!value) {
    return "Unlisted";
  }

  const numeric = Number.parseFloat(value);

  if (!Number.isFinite(numeric)) {
    return "Unlisted";
  }

  return `${numeric.toFixed(3)} au`;
}

function deriveStatus(magnitude: number, observableMinutes: number) {
  if (magnitude <= 11.5 && observableMinutes >= 40) {
    return "Prime window";
  }

  if (observableMinutes < 30) {
    return "Tight window";
  }

  if (magnitude <= 14.5) {
    return "Usable tonight";
  }

  return "Faint target";
}

function deriveVisibility(magnitude: number, observableMinutes: number, moonAngle: number) {
  const score =
    100 - (magnitude - 8) * 6 + observableMinutes * 0.55 + Math.max(moonAngle, 0) * 0.12;

  return Math.max(18, Math.min(98, Math.round(score)));
}

function deriveSynopsis(
  orbitClass: string,
  perihelionDistance: string,
  magnitude: string,
  observatory: string,
) {
  return `${orbitClass} flagged by JPL's observability feed for ${observatory}. The current nightly solution lists magnitude ${magnitude} and perihelion distance ${perihelionDistance}.`;
}

function buildChecklist(name: string, maxObservable: string, moonAngle: string) {
  return [
    `Start the first imaging pass before the ${name} window compresses beyond ${maxObservable}.`,
    `Keep annotations tied to the JPL moon-angle estimate of ${moonAngle} for glare planning.`,
    "Save one clean frame and one operator note for the next handoff.",
  ];
}

function buildWindows(row: string[]) {
  const [designation, fullName, rise, transit, set, maxObservable, rightAscension, declination] =
    row;

  return [
    {
      label: "Rise",
      time: cleanTime(rise),
      duration: maxObservable,
      altitude: `R.A. ${rightAscension}`,
      note: `${designation} enters the dark queue for ${fullName}.`,
    },
    {
      label: "Transit",
      time: cleanTime(transit),
      duration: maxObservable,
      altitude: `Dec. ${declination}`,
      note: "Highest night leverage for framing and stack consistency.",
    },
    {
      label: "Set",
      time: cleanTime(set),
      duration: maxObservable,
      altitude: "Dark-window edge",
      note: "Wrap before the object exits dark-time coverage.",
    },
  ];
}

function buildLogEntries(
  row: string[],
  detail: SbdbResponse,
  period: string,
  perihelionDistance: string,
  topocentricRange: string,
  solarElongation: string,
) {
  const magnitude = row[8];
  const solutionDate = detail.orbit?.soln_date ?? "Recent";
  const lastObservation = detail.orbit?.last_obs ?? "Recent";
  const dataArc = detail.orbit?.data_arc ?? "N/A";

  return [
    {
      time: cleanTime(row[2]),
      title: "Brightness pass",
      detail: `JPL observability feed lists ${row[1]} at ${magnitude} with ${row[5]} of dark-time visibility.`,
      quality: "Live",
    },
    {
      time: cleanTime(row[3]),
      title: "Orbit solution",
      detail: `SBDB solution updated ${solutionDate} with a ${dataArc}-day data arc and period ${period}.`,
      quality: "Fresh",
    },
    {
      time: cleanTime(row[4]),
      title: "Geometry check",
      detail: `Perihelion ${perihelionDistance}, observer range ${topocentricRange}, solar elongation ${solarElongation}, last observed ${lastObservation}.`,
      quality: "Verified",
    },
  ];
}

function buildAlerts(
  row: string[],
  magnitude: number,
  moonAngle: number,
  observableMinutes: number,
  closeApproachCount: number,
) {
  const alerts: TrackerAlert[] = [];

  if (magnitude <= 11.5) {
    alerts.push({
      level: "High",
      title: "Bright target",
      detail: `The current visual magnitude estimate is ${row[8]}, which makes this one of the strongest comet targets in tonight's feed.`,
    });
  }

  if (observableMinutes < 45) {
    alerts.push({
      level: "Watch",
      title: "Short dark window",
      detail: `Only ${row[5]} of dark-time observability is listed, so the queue needs to stay settled before rise.`,
    });
  }

  if (moonAngle < 60) {
    alerts.push({
      level: "Watch",
      title: "Moon proximity",
      detail: `The observability feed shows an object-moon angle of ${row[12]} degrees, so glare management matters.`,
    });
  }

  if (closeApproachCount > 0) {
    alerts.push({
      level: "Info",
      title: "Ancillary records available",
      detail: `SBDB currently reports ${closeApproachCount} close-approach record${closeApproachCount === 1 ? "" : "s"} for this comet.`,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      level: "Info",
      title: "Stable observing slot",
      detail: "No immediate geometry or duration warnings were derived from the current JPL payload.",
    });
  }

  return alerts;
}

function splitCometName(fullName: string, designation: string) {
  const cleaned = fullName.replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return {
      name: designation,
      designation,
    };
  }

  const parenthetical = cleaned.match(/^(.+?)\s+\((.+)\)$/);

  if (parenthetical) {
    return {
      name: parenthetical[2],
      designation: parenthetical[1].trim(),
    };
  }

  const slashIndex = cleaned.indexOf("/");

  if (slashIndex !== -1 && slashIndex < cleaned.length - 1) {
    return {
      name: cleaned.slice(slashIndex + 1),
      designation: cleaned.slice(0, slashIndex + 1).trim(),
    };
  }

  return {
    name: cleaned,
    designation,
  };
}

function buildSkyConditions(
  observatoryName: string,
  observatoryCode: string,
  night: Record<string, string> | undefined,
  observationDate: string,
): TrackerSkyCondition[] {
  return [
    {
      label: "Observatory",
      value: observatoryCode,
      note: observatoryName,
    },
    {
      label: "Dark time",
      value: night?.dark_time ?? "Unavailable",
      note: `Night summary for ${observationDate} in UTC.`,
    },
    {
      label: "Dark window",
      value: `${night?.begin_dark ?? "N/A"} to ${night?.end_dark ?? "N/A"}`,
      note: "Astronomical darkness from the JPL observability feed.",
    },
    {
      label: "Moon",
      value: `${night?.moon_set ?? "N/A"} / ${night?.moon_rise ?? "N/A"}`,
      note: "Moon set and rise times during the same observing night.",
    },
  ];
}

async function fetchCometDetail(designation: string) {
  const url = buildUrl(SBDB_URL, {
    des: designation,
    "phys-par": "1",
    "ca-data": "1",
  });

  return fetchJson<SbdbResponse>(url);
}

export async function getCometTrackerData(options?: {
  observatoryCode?: string;
  observationDate?: string;
  maxComets?: number;
}) {
  const observatoryCode = options?.observatoryCode ?? DEFAULT_OBSERVATORY_CODE;
  const observationDate = options?.observationDate ?? new Date().toISOString().slice(0, 10);
  const maxComets = options?.maxComets ?? DEFAULT_MAX_COMETS;

  const observabilityUrl = buildUrl(OBSERVABILITY_URL, {
    "mpc-code": observatoryCode,
    "obs-time": observationDate,
    "sb-kind": "c",
    optical: "true",
    "mag-required": "true",
    "output-sort": "vmag",
    maxoutput: `${maxComets}`,
  });

  const observability = await fetchJson<ObservabilityResponse>(observabilityUrl);
  const rows = observability.data ?? [];

  if (!rows.length) {
    throw new Error("The JPL observability feed returned no comet targets for the current query.");
  }

  const cometDetails = await Promise.all(rows.map((row) => fetchCometDetail(row[0])));

  const comets = rows.map((row, index) => {
    const detail = cometDetails[index];
    const fullName = detail.object?.fullname ?? row[1];
    const orbitClass = detail.object?.orbit_class?.name?.replace("*", "") ?? "Comet";
    const period = formatPeriod(getElementValue(detail.orbit?.elements, "per"), orbitClass);
    const perihelionDistance = formatDistance(getElementValue(detail.orbit?.elements, "q"));
    const topocentricRange = `${row[10]} au`;
    const solarElongation = `${row[11]} deg`;
    const moonAngle = `${row[12]} deg`;
    const magnitudeValue = parseMagnitude(row[8]);
    const moonAngleValue = parseAngle(row[12]);
    const observableMinutes = parseObservableMinutes(row[5]);
    const visibility = deriveVisibility(magnitudeValue, observableMinutes, moonAngleValue);
    const status = deriveStatus(magnitudeValue, observableMinutes);
    const splitName = splitCometName(fullName, row[0]);
    const synopsis = deriveSynopsis(
      orbitClass,
      perihelionDistance,
      row[8],
      observability.location ?? observatoryCode,
    );

    return {
      id: detail.object?.des ?? row[0],
      name: splitName.name,
      designation: splitName.designation,
      status,
      accent: accentPalette[index % accentPalette.length],
      synopsis,
      orbitClass,
      period,
      perihelionDistance,
      topocentricRange,
      solarElongation,
      moonAngle,
      magnitude: row[8],
      rightAscension: row[6],
      declination: row[7],
      nextWindow: cleanTime(row[2]),
      visibility,
      checklist: buildChecklist(splitName.name, row[5], moonAngle),
      windows: buildWindows(row),
      log: buildLogEntries(
        row,
        detail,
        period,
        perihelionDistance,
        topocentricRange,
        solarElongation,
      ),
      alerts: buildAlerts(
        row,
        magnitudeValue,
        moonAngleValue,
        observableMinutes,
        detail.ca_data?.length ?? 0,
      ),
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    observationDate,
    observatory: {
      code: observatoryCode,
      name: observability.location ?? "Unknown observatory",
      beginDark: observability.obs_night?.begin_dark ?? "Unavailable",
      endDark: observability.obs_night?.end_dark ?? "Unavailable",
      darkTime: observability.obs_night?.dark_time ?? "Unavailable",
    },
    skyConditions: buildSkyConditions(
      observability.location ?? "Unknown observatory",
      observatoryCode,
      observability.obs_night,
      observationDate,
    ),
    comets,
    source: {
      observabilityApi: observabilityUrl,
      sbdbApi: SBDB_URL,
    },
  } satisfies TrackerPayload;
}
