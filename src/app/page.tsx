"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  equatorialToHorizontal,
  getSignedAngleDifference,
  normalizeHeading,
} from "@/lib/astronomy";
import type { TrackerAlert, TrackerPayload } from "@/lib/jpl";

type WatchMode = "All sky" | "Imaging" | "Outreach";
type FinderPermissionState = "idle" | "pending" | "granted" | "denied" | "unsupported";
type LocationSnapshot = {
  latitude: number;
  longitude: number;
  accuracy: number;
};
type CompassOrientationEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number | null;
};
type DeviceOrientationPermissionEvent = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

const watchModes: WatchMode[] = ["All sky", "Imaging", "Outreach"];
const emptyComets: TrackerPayload["comets"] = [];

const modeGuidance: Record<WatchMode, { title: string; detail: string }> = {
  "All sky": {
    title: "Balance the brightest windows with the longest dark-time coverage.",
    detail:
      "Keep the queue centered on the strongest JPL visibility scores, then use the orbit panel to choose which target deserves the next imaging pass.",
  },
  Imaging: {
    title: "Prioritize transit timing, magnitude, and clean moon separation.",
    detail:
      "Use the nightly observability windows as the schedule of record, and bias your captures toward the comet with the cleanest geometry at transit.",
  },
  Outreach: {
    title: "Choose targets that are bright, recognizable, and easy to explain live.",
    detail:
      "Lead with the brightest catalog entry, keep the observatory window in view, and use the derived notes as operator-ready narration.",
  },
};

function formatClock(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function formatGeneratedAt(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function getAlertTone(level: TrackerAlert["level"]) {
  if (level === "High") return "text-[#ffe09e]";
  if (level === "Watch") return "text-[#9be7ff]";
  return "text-[#b9ffd6]";
}

export default function Home() {
  const [payload, setPayload] = useState<TrackerPayload | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [watchMode, setWatchMode] = useState<WatchMode>("All sky");
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData(initial = false) {
      if (initial) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await fetch("/api/comets", { cache: "no-store" });
        const data = (await response.json()) as TrackerPayload | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error ? data.error : "Unable to load comet data.",
          );
        }

        if (cancelled) {
          return;
        }

        setPayload(data as TrackerPayload);
        setSelectedId((current) => current ?? (data as TrackerPayload).comets[0]?.id ?? null);
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load comet data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadData(true);
    const interval = window.setInterval(() => {
      void loadData(false);
    }, 60 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!payload?.comets.length) {
      return;
    }

    if (!selectedId || !payload.comets.some((comet) => comet.id === selectedId)) {
      setSelectedId(payload.comets[0].id);
    }
  }, [payload, selectedId]);

  const comets = payload?.comets ?? emptyComets;
  const selected = comets.find((comet) => comet.id === selectedId) ?? comets[0] ?? null;

  const missionStats = useMemo(() => {
    if (!comets.length) {
      return {
        watchCount: 0,
        meanMagnitude: "0.0",
        longestWindow: "Unavailable",
        nextWindow: "Unavailable",
      };
    }

    const watchCount = comets.filter((comet) => comet.visibility >= 70).length;
    const meanMagnitude =
      comets.reduce((total, comet) => total + Number.parseFloat(comet.magnitude), 0) /
      comets.length;
    const longestWindow = [...comets].sort((left, right) => right.visibility - left.visibility)[0];
    const nextWindow = [...comets].sort((left, right) =>
      left.nextWindow.localeCompare(right.nextWindow),
    )[0];

    return {
      watchCount,
      meanMagnitude: meanMagnitude.toFixed(1),
      longestWindow: longestWindow.name,
      nextWindow: `${nextWindow.name} · ${nextWindow.nextWindow} UTC`,
    };
  }, [comets]);

  const accentStyle = {
    "--accent": selected?.accent ?? "#9BE7FF",
  } as CSSProperties;

  if (loading && !payload) {
    return (
      <main className="relative min-h-screen overflow-hidden">
        <div className="relative mx-auto flex min-h-screen max-w-[960px] items-center px-4 py-6 sm:px-6">
          <section className="panel w-full rounded-[34px] px-6 py-8 sm:px-8 sm:py-10">
            <p className="eyebrow">Comet Tracker</p>
            <h1 className="mt-3 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Connecting to the JPL feed
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
              Pulling live comet observability from NASA/JPL&apos;s free APIs and building tonight&apos;s
              queue.
            </p>
            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-[color:var(--accent)]" />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main style={accentStyle} className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(120,174,255,0.22),_transparent_60%)]" />
        <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[rgba(92,132,255,0.18)] blur-3xl" />
        <div className="absolute bottom-10 right-[-6rem] h-80 w-80 rounded-full bg-[rgba(155,231,255,0.12)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header
          className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
          style={{ animationDelay: "0.06s" }}
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">NASA/JPL small-body observation workspace</p>
              <h1 className="mt-3 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
                Comet Tracker
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                Live comet queue powered by JPL&apos;s Small-Body Observability API and SBDB. The
                dashboard below is built from tonight&apos;s free feed for {payload?.observatory.name} (
                {payload?.observatory.code}).
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <div className="flex flex-wrap gap-2">
                {watchModes.map((mode) => {
                  const active = mode === watchMode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWatchMode(mode)}
                      className={`rounded-full border px-4 py-2 text-sm transition duration-300 ${
                        active
                          ? "border-white/[0.30] bg-white/[0.12] text-white shadow-[0_0_30px_rgba(155,231,255,0.12)]"
                          : "border-white/[0.10] bg-white/[0.05] text-[color:var(--muted)] hover:-translate-y-0.5 hover:border-white/[0.25] hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
              <div className="text-left lg:text-right">
                <p className="eyebrow">Station time · UTC</p>
                <p className="mt-2 font-mono text-lg text-white">{formatClock(now)}</p>
                <p className="mt-2 text-xs text-[color:var(--muted)]">
                  {refreshing ? "Refreshing JPL feed..." : `Last refresh ${formatGeneratedAt(payload?.generatedAt ?? now.toISOString())} UTC`}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-px overflow-hidden rounded-[24px] border border-white/[0.10] bg-white/[0.05] sm:grid-cols-2 xl:grid-cols-4">
            <div className="bg-[rgba(4,10,22,0.78)] px-4 py-4">
              <p className="label">Priority targets</p>
              <p className="stat-value mt-3 text-white">{missionStats.watchCount}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Comets currently scoring 70+ visibility.
              </p>
            </div>
            <div className="bg-[rgba(4,10,22,0.78)] px-4 py-4">
              <p className="label">Mean magnitude</p>
              <p className="stat-value mt-3 text-white">{missionStats.meanMagnitude}</p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Visual magnitude estimate from the observability feed.
              </p>
            </div>
            <div className="bg-[rgba(4,10,22,0.78)] px-4 py-4">
              <p className="label">Top score</p>
              <p className="mt-3 text-2xl font-medium tracking-[-0.06em] text-white">
                {missionStats.longestWindow}
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Highest combined visibility score in the current queue.
              </p>
            </div>
            <div className="bg-[rgba(4,10,22,0.78)] px-4 py-4">
              <p className="label">Next rise</p>
              <p className="mt-3 text-2xl font-medium tracking-[-0.06em] text-white">
                {missionStats.nextWindow}
              </p>
              <p className="mt-2 text-sm text-[color:var(--muted)]">
                Sorted from the current nightly JPL response.
              </p>
            </div>
          </div>
        </header>

        {error ? (
          <section className="panel mt-4 rounded-[28px] border border-[#ffb08b]/40 px-5 py-5 text-[#ffe3d1]">
            <p className="eyebrow">Feed warning</p>
            <p className="mt-3 text-lg font-medium tracking-[-0.04em] text-white">
              The live JPL request did not complete.
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{error}</p>
          </section>
        ) : null}

        <div className="mt-4 grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          <aside
            className="panel reveal flex flex-col rounded-[30px] px-4 py-5 sm:px-5"
            style={{ animationDelay: "0.12s" }}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Tracked comets</p>
                <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">Queue</h2>
              </div>
              <p className="rounded-full border border-white/[0.10] bg-white/[0.06] px-3 py-1 font-mono text-xs text-[color:var(--muted)]">
                {comets.length} targets
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {comets.map((comet) => {
                const active = selected?.id === comet.id;
                return (
                  <button
                    key={comet.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedId(comet.id)}
                    className="w-full rounded-[24px] border px-4 py-4 text-left transition duration-300 hover:-translate-y-1"
                    style={
                      active
                        ? {
                            borderColor: `${comet.accent}66`,
                            background: `linear-gradient(180deg, ${comet.accent}18, rgba(9, 18, 33, 0.82))`,
                            boxShadow: `0 24px 40px rgba(0, 0, 0, 0.28), inset 0 0 0 1px ${comet.accent}22`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-medium tracking-[-0.04em] text-white">
                          {comet.name}
                        </p>
                        <p className="mt-1 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">
                          {comet.designation}
                        </p>
                      </div>
                      <span
                        className="mt-1 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: comet.accent,
                          boxShadow: `0 0 18px ${comet.accent}`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-[color:var(--muted)]">{comet.status}</span>
                      <span className="font-mono text-white">{comet.visibility}% score</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${comet.visibility}%`, backgroundColor: comet.accent }}
                      />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[color:var(--muted)]">
                      <div>
                        <p className="label">Rise</p>
                        <p className="mt-1 font-mono text-sm text-white">{comet.nextWindow} UTC</p>
                      </div>
                      <div>
                        <p className="label">Vmag</p>
                        <p className="mt-1 font-mono text-sm text-white">{comet.magnitude}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4">
              <p className="eyebrow">Mode guidance</p>
              <p className="mt-3 text-lg font-medium tracking-[-0.04em] text-white">
                {modeGuidance[watchMode].title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                {modeGuidance[watchMode].detail}
              </p>
            </div>
          </aside>

          <div className="flex flex-col gap-4">
            {selected ? (
              <>
                <section
                  className="panel reveal rounded-[34px] px-5 py-5 sm:px-6 sm:py-6"
                  style={{ animationDelay: "0.18s" }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <p className="eyebrow">Selected target</p>
                      <h2 className="mt-2 text-4xl font-medium tracking-[-0.08em] text-white">
                        {selected.name}
                      </h2>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">
                        {selected.synopsis}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/[0.10] bg-white/[0.05] px-4 py-2 text-sm text-white">
                      {selected.status}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
                    <div className="data-grid relative min-h-[420px] overflow-hidden rounded-[30px] border border-white/[0.10] bg-[rgba(4,11,22,0.72)] p-5 sm:p-6">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(155,231,255,0.14),_transparent_20%),radial-gradient(circle_at_78%_28%,_rgba(255,210,122,0.12),_transparent_18%)]" />
                      <div className="absolute right-[-10%] top-1/2 h-[28rem] w-[28rem] -translate-y-1/2">
                        <div className="orbit-ring absolute inset-0 opacity-45" />
                        <div className="orbit-ring absolute inset-[12%] opacity-35 [animation-duration:32s]" />
                        <div className="orbit-ring absolute inset-[24%] opacity-25 [animation-duration:24s]" />
                        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_36px_rgba(255,255,255,0.8)]" />
                        <div
                          className="animate-pulse-soft absolute left-[63%] top-[22%] h-4 w-4 rounded-full bg-[color:var(--accent)]"
                          style={{ boxShadow: `0 0 26px ${selected.accent}` }}
                        >
                          <div
                            className="absolute left-1/2 top-1/2 h-px w-28 -translate-y-1/2"
                            style={{
                              background: `linear-gradient(to right, ${selected.accent}, transparent)`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                        <div className="max-w-xl">
                          <p className="label">Current sky position</p>
                          <p className="mt-4 text-5xl font-medium tracking-[-0.1em] text-white sm:text-6xl">
                            {selected.rightAscension}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                            Declination {selected.declination}. This target is listed in the current
                            JPL nightly queue for {payload?.observatory.name} with the next rise at{" "}
                            {selected.nextWindow} UTC.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:max-w-[65%]">
                          <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4">
                            <p className="label">Topo. range</p>
                            <p className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                              {selected.topocentricRange}
                            </p>
                            <p className="mt-2 text-sm text-[color:var(--muted)]">
                              Observer-to-comet range from the observability feed.
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4">
                            <p className="label">Solar elong.</p>
                            <p className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                              {selected.solarElongation}
                            </p>
                            <p className="mt-2 text-sm text-[color:var(--muted)]">
                              Object-observer-sun angle from JPL.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <PhoneFinderPanel selected={selected} now={now} />

                      <div className="rounded-[28px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4 sm:p-5">
                        <p className="eyebrow">Orbital metrics</p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                          <Metric label="Orbit class" value={selected.orbitClass} hint="SBDB classification" />
                          <Metric label="Period" value={selected.period} hint="Derived from SBDB elements" />
                          <Metric
                            label="Perihelion"
                            value={selected.perihelionDistance}
                            hint="Closest solar pass distance"
                          />
                          <Metric label="Moon angle" value={selected.moonAngle} hint="Observer-moon separation" />
                        </div>
                      </div>

                      <div className="rounded-[28px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4 sm:p-5">
                        <p className="eyebrow">Observation checklist</p>
                        <ul className="mt-4 space-y-3">
                          {selected.checklist.map((item) => (
                            <li
                              key={item}
                              className="flex gap-3 rounded-[20px] border border-white/[0.08] bg-[rgba(0,0,0,0.18)] px-4 py-3 text-sm leading-6 text-[color:var(--muted)]"
                            >
                              <span
                                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{
                                  backgroundColor: selected.accent,
                                  boxShadow: `0 0 16px ${selected.accent}`,
                                }}
                              />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                  <section
                    className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
                    style={{ animationDelay: "0.24s" }}
                  >
                    <p className="eyebrow">Observation timeline</p>
                    <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                      Tonight&apos;s windows
                    </h3>
                    <div className="mt-5 space-y-4">
                      {selected.windows.map((window, index) => (
                        <div key={window.label} className="relative pl-8">
                          <div className="absolute left-0 top-1.5 flex h-full flex-col items-center">
                            <span
                              className="h-3 w-3 rounded-full"
                              style={{
                                backgroundColor: selected.accent,
                                boxShadow: `0 0 18px ${selected.accent}`,
                              }}
                            />
                            {index < selected.windows.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-white/[0.10]" />
                            ) : null}
                          </div>
                          <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-lg font-medium tracking-[-0.04em] text-white">
                                {window.label}
                              </p>
                              <p className="font-mono text-sm text-[color:var(--muted)]">
                                {window.time} UTC
                              </p>
                            </div>
                            <div className="mt-3 grid gap-3 text-sm text-[color:var(--muted)] sm:grid-cols-2">
                              <p>Observable: {window.duration}</p>
                              <p>{window.altitude}</p>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                              {window.note}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section
                    className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
                    style={{ animationDelay: "0.3s" }}
                  >
                    <p className="eyebrow">Observation log</p>
                    <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                      Feed-derived notes
                    </h3>
                    <div className="mt-5 divide-y divide-white/[0.08] overflow-hidden rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)]">
                      {selected.log.map((entry) => (
                        <div
                          key={`${entry.time}-${entry.title}`}
                          className="grid gap-3 px-4 py-4 transition duration-300 hover:bg-white/[0.06] sm:grid-cols-[110px_minmax(0,1fr)_100px] sm:items-start"
                        >
                          <p className="font-mono text-sm text-[color:var(--muted)]">{entry.time}</p>
                          <div>
                            <p className="text-base font-medium tracking-[-0.03em] text-white">
                              {entry.title}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                              {entry.detail}
                            </p>
                          </div>
                          <p className="font-mono text-sm text-white sm:text-right">{entry.quality}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            ) : (
              <section className="panel rounded-[34px] px-6 py-8">
                <p className="eyebrow">No targets</p>
                <p className="mt-3 text-lg text-white">
                  The current feed did not return any comet rows for this observatory and date.
                </p>
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <section
              className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
              style={{ animationDelay: "0.16s" }}
            >
              <p className="eyebrow">Sky conditions</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                Site readout
              </h2>
              <div className="mt-5 space-y-3">
                {(payload?.skyConditions ?? []).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                      <p className="font-mono text-sm text-white">{item.value}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
              style={{ animationDelay: "0.22s" }}
            >
              <p className="eyebrow">Active alerts</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                Watchlist
              </h2>
              <div className="mt-5 space-y-3">
                {(selected?.alerts ?? []).map((alert) => (
                  <div
                    key={alert.title}
                    className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-base font-medium tracking-[-0.03em] text-white">
                        {alert.title}
                      </p>
                      <p
                        className={`font-mono text-xs uppercase tracking-[0.22em] ${getAlertTone(alert.level)}`}
                      >
                        {alert.level}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                      {alert.detail}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="panel reveal rounded-[30px] px-5 py-5 sm:px-6"
              style={{ animationDelay: "0.28s" }}
            >
              <p className="eyebrow">Mission summary</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                Feed status
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-6 text-[color:var(--muted)]">
                <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4">
                  <p className="label">Lead target</p>
                  <p className="mt-2 text-lg font-medium tracking-[-0.03em] text-white">
                    {selected?.name ?? "Unavailable"}
                  </p>
                  <p className="mt-2">
                    {selected
                      ? `${selected.name} currently leads the queue for ${watchMode.toLowerCase()} mode.`
                      : "No selected comet is available right now."}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4">
                  <p className="label">Observatory</p>
                  <p className="mt-2">
                    {payload?.observatory.name} ({payload?.observatory.code}) with dark time from{" "}
                    {payload?.observatory.beginDark} to {payload?.observatory.endDark} UTC.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] px-4 py-4">
                  <p className="label">Data source</p>
                  <p className="mt-2">
                    Free NASA/JPL Small-Body Observability + SBDB feeds, refreshed hourly through the
                    local Next.js API route.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/[0.10] bg-[rgba(0,0,0,0.16)] px-4 py-4">
      <p className="label">{label}</p>
      <p className="mt-2 text-xl font-medium tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{hint}</p>
    </div>
  );
}

function PhoneFinderPanel({
  selected,
  now,
}: {
  selected: TrackerPayload["comets"][number];
  now: Date;
}) {
  const [locationStatus, setLocationStatus] = useState<FinderPermissionState>("idle");
  const [orientationStatus, setOrientationStatus] = useState<FinderPermissionState>("idle");
  const [location, setLocation] = useState<LocationSnapshot | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [orientationError, setOrientationError] = useState<string | null>(null);
  const [finderBusy, setFinderBusy] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unsupported");
    }

    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") {
      setOrientationStatus("unsupported");
    }
  }, []);

  useEffect(() => {
    if (locationStatus !== "granted" || typeof navigator === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError(null);
      },
      (error) => {
        if (error.code === 1) {
          setLocationStatus("denied");
          setLocationError(
            "Location access is required to place the comet in your local sky.",
          );
          return;
        }

        setLocationError(
          "The phone could not refresh its position. The last known fix is still being used.",
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 10000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationStatus]);

  useEffect(() => {
    if (orientationStatus !== "granted" || typeof window === "undefined") {
      return;
    }

    const handleOrientation = (event: CompassOrientationEvent) => {
      let nextHeading: number | null = null;

      if (typeof event.webkitCompassHeading === "number") {
        nextHeading = event.webkitCompassHeading;
      } else if (typeof event.alpha === "number") {
        nextHeading = 360 - event.alpha;
      }

      if (nextHeading === null || !Number.isFinite(nextHeading)) {
        return;
      }

      setHeading(normalizeHeading(nextHeading));
      setOrientationError(null);
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
    window.addEventListener("deviceorientation", handleOrientation as EventListener, true);

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation as EventListener,
        true,
      );
      window.removeEventListener("deviceorientation", handleOrientation as EventListener, true);
    };
  }, [orientationStatus]);

  const skyPosition = useMemo(() => {
    if (!location) {
      return null;
    }

    return equatorialToHorizontal(
      selected.rightAscension,
      selected.declination,
      {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      now,
    );
  }, [location, now, selected.declination, selected.rightAscension]);

  const turnDelta =
    skyPosition && heading !== null ? getSignedAngleDifference(skyPosition.azimuth, heading) : null;
  const directionLabel = skyPosition ? formatCompassDirection(skyPosition.azimuth) : null;
  const finderCopy = getFinderCopy(selected.name, skyPosition, turnDelta, heading);
  const actionLabel = getFinderActionLabel(locationStatus, orientationStatus, finderBusy);

  async function requestLocationAccess() {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocationStatus("unsupported");
      setLocationError("This browser does not expose phone location.");
      return false;
    }

    setLocationStatus("pending");
    setLocationError(null);

    return new Promise<boolean>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setLocationStatus("granted");
          resolve(true);
        },
        (error) => {
          if (error.code === 1) {
            setLocationStatus("denied");
            setLocationError(
              "Location access was denied, so the finder cannot solve altitude and azimuth for your phone.",
            );
          } else {
            setLocationStatus("idle");
            setLocationError(
              "The phone could not lock a position yet. Try again outdoors or enable precise location.",
            );
          }

          resolve(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        },
      );
    });
  }

  async function requestOrientationAccess() {
    if (typeof window === "undefined" || typeof window.DeviceOrientationEvent === "undefined") {
      setOrientationStatus("unsupported");
      setOrientationError("This browser does not expose compass heading data.");
      return false;
    }

    setOrientationStatus("pending");
    setOrientationError(null);

    try {
      const orientationEvent = window.DeviceOrientationEvent as DeviceOrientationPermissionEvent;

      if (typeof orientationEvent.requestPermission === "function") {
        const permissionState = await orientationEvent.requestPermission();

        if (permissionState !== "granted") {
          setOrientationStatus("denied");
          setOrientationError(
            "Compass access was denied, so the finder can only show the target's direction in the sky.",
          );
          return false;
        }
      }

      setOrientationStatus("granted");
      return true;
    } catch {
      setOrientationStatus("denied");
      setOrientationError("Compass access could not be enabled in this browser.");
      return false;
    }
  }

  async function enableFinder() {
    setFinderBusy(true);

    try {
      const pendingRequests: Promise<boolean>[] = [];

      if (orientationStatus !== "granted" && orientationStatus !== "unsupported") {
        pendingRequests.push(requestOrientationAccess());
      }

      if (locationStatus !== "granted") {
        pendingRequests.push(requestLocationAccess());
      }

      if (pendingRequests.length > 0) {
        await Promise.allSettled(pendingRequests);
      }
    } finally {
      setFinderBusy(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-white/[0.10] bg-[rgba(255,255,255,0.04)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Phone finder</p>
          <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Point to {selected.name}
          </h3>
        </div>
        <div className="rounded-full border border-white/[0.10] bg-white/[0.05] px-3 py-1 font-mono text-xs text-[color:var(--muted)]">
          Mobile
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
        Use your phone&apos;s location and compass to convert the selected comet into a live
        direction in your own sky.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void enableFinder()}
          disabled={finderBusy}
          className="rounded-full border border-white/[0.18] bg-white/[0.08] px-4 py-2 text-sm text-white transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.12] disabled:cursor-wait disabled:opacity-70"
        >
          {actionLabel}
        </button>
        <div className="rounded-full border border-white/[0.10] bg-[rgba(0,0,0,0.18)] px-3 py-2 font-mono text-xs text-[color:var(--muted)]">
          {location ? `±${Math.round(location.accuracy)} m` : "No location fix"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <FinderStatus label="Location" status={locationStatus} />
        <FinderStatus label="Compass" status={orientationStatus} />
      </div>

      {skyPosition ? (
        <>
          <div className="mt-5 rounded-[24px] border border-white/[0.10] bg-[rgba(0,0,0,0.18)] p-4">
            <p className="label">Live guidance</p>
            <p className="mt-3 text-xl font-medium tracking-[-0.04em] text-white">
              {finderCopy.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{finderCopy.detail}</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_148px] sm:items-center">
            <div className="grid gap-3 sm:grid-cols-2">
              <FinderMetric
                label="Altitude"
                value={`${formatSignedDegrees(skyPosition.altitude)} ${skyPosition.altitude >= 0 ? "up" : "down"}`}
              />
              <FinderMetric
                label="Azimuth"
                value={`${skyPosition.azimuth.toFixed(1)}° ${directionLabel ?? ""}`.trim()}
              />
              <FinderMetric
                label="Turn"
                value={
                  turnDelta === null
                    ? "Compass needed"
                    : `${Math.abs(turnDelta).toFixed(0)}° ${turnDelta >= 0 ? "right" : "left"}`
                }
              />
              <FinderMetric
                label="Phone heading"
                value={heading === null ? "Waiting" : `${heading.toFixed(1)}°`}
              />
            </div>

            <div className="relative mx-auto h-36 w-36 rounded-full border border-white/[0.12] bg-[radial-gradient(circle_at_top,_rgba(155,231,255,0.18),_rgba(6,10,22,0.92))]">
              <div className="absolute inset-3 rounded-full border border-white/[0.10]" />
              <span className="absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[11px] text-[color:var(--muted)]">
                N
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[color:var(--muted)]">
                E
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[11px] text-[color:var(--muted)]">
                S
              </span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[color:var(--muted)]">
                W
              </span>

              <div className="absolute left-1/2 top-4 h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)]" />

              {turnDelta !== null ? (
                <div
                  className="absolute inset-3 transition-transform duration-300"
                  style={{ transform: `rotate(${turnDelta}deg)` }}
                >
                  <div className="absolute left-1/2 top-1 flex -translate-x-1/2 flex-col items-center">
                    <div
                      className="h-11 w-0.5"
                      style={{
                        background: `linear-gradient(to bottom, ${selected.accent}, transparent)`,
                      }}
                    />
                    <div
                      className="mt-1 h-3.5 w-3.5 rounded-full"
                      style={{
                        backgroundColor: selected.accent,
                        boxShadow: `0 0 18px ${selected.accent}`,
                      }}
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-white/[0.12] bg-[rgba(0,0,0,0.14)] p-4 text-sm leading-6 text-[color:var(--muted)]">
          Enable location to solve {selected.name}&apos;s altitude and azimuth from your phone.
          The finder will then show where to point and whether the comet is above your horizon.
        </div>
      )}

      {locationError ? (
        <p className="mt-4 text-sm leading-6 text-[#ffd8c4]">{locationError}</p>
      ) : null}
      {orientationError ? (
        <p className="mt-2 text-sm leading-6 text-[#ffd8c4]">{orientationError}</p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[color:var(--muted)]">
        Best results come outdoors with the phone held upright. If the heading looks wrong, move
        the phone in a figure-eight to recalibrate the compass.
      </p>
    </section>
  );
}

function FinderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[rgba(255,255,255,0.04)] px-4 py-3">
      <p className="label">{label}</p>
      <p className="mt-2 text-base font-medium tracking-[-0.03em] text-white">{value}</p>
    </div>
  );
}

function FinderStatus({
  label,
  status,
}: {
  label: string;
  status: FinderPermissionState;
}) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[rgba(255,255,255,0.04)] px-4 py-3">
      <p className="label">{label}</p>
      <p className="mt-2 text-sm font-medium text-white">{formatFinderStatus(status)}</p>
    </div>
  );
}

function getFinderActionLabel(
  locationStatus: FinderPermissionState,
  orientationStatus: FinderPermissionState,
  finderBusy: boolean,
) {
  if (finderBusy) {
    return "Connecting sensors...";
  }

  if (locationStatus !== "granted") {
    return "Enable phone finder";
  }

  if (orientationStatus !== "granted" && orientationStatus !== "unsupported") {
    return "Enable compass";
  }

  return "Refresh location";
}

function formatFinderStatus(status: FinderPermissionState) {
  if (status === "granted") return "Connected";
  if (status === "pending") return "Requesting";
  if (status === "denied") return "Denied";
  if (status === "unsupported") return "Unavailable";
  return "Not enabled";
}

function formatCompassDirection(azimuth: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(azimuth / 45) % directions.length;
  return directions[index];
}

function formatSignedDegrees(value: number) {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${Math.abs(value).toFixed(1)}°`;
}

function getFinderCopy(
  name: string,
  skyPosition: ReturnType<typeof equatorialToHorizontal>,
  turnDelta: number | null,
  heading: number | null,
) {
  if (!skyPosition) {
    return {
      title: `Waiting for a sky solution for ${name}`,
      detail: "Enable location so the finder can place the selected comet in your current sky.",
    };
  }

  if (skyPosition.altitude < 0) {
    return {
      title: `${name} is below your horizon`,
      detail: `From your current location, the comet is ${Math.abs(skyPosition.altitude).toFixed(1)} degrees below the horizon toward ${formatCompassDirection(skyPosition.azimuth)}.`,
    };
  }

  if (heading === null || turnDelta === null) {
    return {
      title: `Aim toward ${formatCompassDirection(skyPosition.azimuth)}`,
      detail: `The comet is ${skyPosition.altitude.toFixed(1)} degrees above your horizon at azimuth ${skyPosition.azimuth.toFixed(1)} degrees. Enable compass access for live turn-by-turn guidance.`,
    };
  }

  if (Math.abs(turnDelta) < 6) {
    return {
      title: "Almost on target",
      detail: `You are lined up within ${Math.abs(turnDelta).toFixed(0)} degrees. Keep the phone pointed about ${skyPosition.altitude.toFixed(1)} degrees above the horizon.`,
    };
  }

  return {
    title: `Turn ${Math.abs(turnDelta).toFixed(0)}° ${turnDelta >= 0 ? "right" : "left"}`,
    detail: `Then hold the phone about ${skyPosition.altitude.toFixed(1)} degrees above the horizon toward ${formatCompassDirection(skyPosition.azimuth)}.`,
  };
}
