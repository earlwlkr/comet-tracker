import type { Metadata } from "next";
import Link from "next/link";
import {
  getDonkiSummary,
  type DonkiCmeView,
  type DonkiFlareView,
  type DonkiGstView,
} from "@/lib/nasa";

export const metadata: Metadata = {
  title: "DONKI | NASA Signal Desk",
  description: "Recent space weather activity from NASA DONKI.",
};

type DonkiPageProps = {
  searchParams: Promise<{ window?: string }>;
};

const allowedWindows = [7, 14, 30] as const;

function resolveWindow(value?: string) {
  const parsed = Number.parseInt(value ?? "14", 10);
  return allowedWindows.includes(parsed as (typeof allowedWindows)[number]) ? parsed : 14;
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getFlareScore(classType: string) {
  const match = classType.match(/^([ABCMX])(\d+(\.\d+)?)$/i);

  if (!match) {
    return 0;
  }

  const letterWeight = { A: 1, B: 10, C: 100, M: 1000, X: 10000 }[
    match[1].toUpperCase() as "A" | "B" | "C" | "M" | "X"
  ];

  return letterWeight * Number.parseFloat(match[2]);
}

function SpaceWeatherTimeline({
  cmes,
  flares,
  rangeEnd,
  rangeDays,
  rangeStart,
  storms,
}: {
  cmes: DonkiCmeView[];
  flares: DonkiFlareView[];
  rangeEnd: number;
  rangeDays: number;
  rangeStart: number;
  storms: DonkiGstView[];
}) {
  const width = 900;
  const height = 230;
  const rows = [
    { label: "FLR", y: 50 },
    { label: "CME", y: 115 },
    { label: "GST", y: 180 },
  ];

  function getX(value: string) {
    const time = new Date(value).getTime();
    const ratio = (time - rangeStart) / (rangeEnd - rangeStart || 1);
    return 90 + Math.min(Math.max(ratio, 0), 1) * (width - 120);
  }

  return (
    <svg className="h-auto w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="DONKI activity timeline">
      <rect fill="rgba(255,255,255,0.02)" height={height} width={width} />
      {rows.map((row) => (
        <g key={row.label}>
          <line
            stroke="rgba(255,255,255,0.14)"
            strokeDasharray="5 7"
            x1="80"
            x2={width - 20}
            y1={row.y}
            y2={row.y}
          />
          <text fill="rgba(255,255,255,0.52)" fontSize="13" x="22" y={row.y + 4}>
            {row.label}
          </text>
        </g>
      ))}
      {Array.from({ length: rangeDays }, (_, index) => index).filter((index) => index % Math.max(1, Math.floor(rangeDays / 6)) === 0).map((index) => {
        const x = 90 + (index / Math.max(rangeDays - 1, 1)) * (width - 120);
        const label = new Date(rangeStart + index * 24 * 60 * 60 * 1000).toISOString().slice(5, 10);

        return (
          <g key={label}>
            <line
              stroke="rgba(255,255,255,0.08)"
              x1={x}
              x2={x}
              y1="24"
              y2={height - 22}
            />
            <text fill="rgba(255,255,255,0.38)" fontSize="12" x={x - 16} y={height - 6}>
              {label}
            </text>
          </g>
        );
      })}
      {flares.map((flare) => (
        <circle
          key={flare.id}
          cx={getX(flare.beginTime)}
          cy="50"
          fill="#ffd36b"
          opacity="0.92"
          r={Math.max(3, Math.min(11, getFlareScore(flare.classType) / 1300))}
        />
      ))}
      {cmes.map((cme) => (
        <rect
          key={cme.id}
          fill="#78c2ff"
          height={Math.max(8, Math.min(28, (cme.speed ?? 300) / 55))}
          opacity="0.9"
          rx="2"
          width="5"
          x={getX(cme.startTime) - 2.5}
          y={115 - Math.max(8, Math.min(28, (cme.speed ?? 300) / 55)) / 2}
        />
      ))}
      {storms.map((storm) => (
        <circle
          key={storm.id}
          cx={getX(storm.startTime)}
          cy="180"
          fill="#ff8a78"
          opacity="0.92"
          r={Math.max(4, Math.min(13, (storm.maxKpIndex ?? 0) * 1.7))}
        />
      ))}
    </svg>
  );
}

export default async function DonkiPage({ searchParams }: DonkiPageProps) {
  const params = await searchParams;
  const windowDays = resolveWindow(params.window);
  const summary = await getDonkiSummary(windowDays);
  const rangeStart = new Date(`${summary.range.startDate}T00:00:00Z`).getTime();
  const rangeEnd = new Date(`${summary.range.endDate}T23:59:59Z`).getTime();

  const strongestFlare = [...summary.flares].sort(
    (left, right) => getFlareScore(right.classType) - getFlareScore(left.classType),
  )[0];
  const fastestCme = [...summary.cmes].sort((left, right) => (right.speed ?? 0) - (left.speed ?? 0))[0];
  const strongestStorm = [...summary.storms].sort(
    (left, right) => (right.maxKpIndex ?? 0) - (left.maxKpIndex ?? 0),
  )[0];

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Database Of Notifications, Knowledge, Information</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="text-3xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Recent solar activity, compressed into one operational read.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              This page pulls recent flare, CME, and geomagnetic storm records directly from DONKI
              and lines them up on one timeline so you can scan pace, severity, and sequencing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 self-start">
            {allowedWindows.map((value) => (
              <Link
                key={value}
                className={`nav-chip ${windowDays === value ? "bg-white/[0.08] text-white" : ""}`}
                href={`/donki?window=${value}`}
              >
                Last {value} days
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface p-5">
          <p className="section-label">Flares</p>
          <p className="metric-value mt-3 text-white">{summary.flares.length}</p>
          <p className="mt-3 text-sm text-white/56">
            Strongest: <span className="text-white">{strongestFlare?.classType ?? "None"}</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="section-label">CMEs</p>
          <p className="metric-value mt-3 text-white">{summary.cmes.length}</p>
          <p className="mt-3 text-sm text-white/56">
            Fastest: <span className="text-white">{fastestCme?.speed ? `${Math.round(fastestCme.speed)} km/s` : "None"}</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="section-label">Geomagnetic storms</p>
          <p className="metric-value mt-3 text-white">{summary.storms.length}</p>
          <p className="mt-3 text-sm text-white/56">
            Peak Kp: <span className="text-white">{strongestStorm?.maxKpIndex ?? "None"}</span>
          </p>
        </div>
        <div className="surface p-5">
          <p className="section-label">Window</p>
          <p className="metric-value mt-3 text-white">{summary.range.windowDays}d</p>
          <p className="mt-3 text-sm text-white/56">
            {summary.range.startDate} to {summary.range.endDate}
          </p>
        </div>
      </section>

      <section className="surface px-4 py-4 sm:px-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Activity timeline</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Relative timing and intensity
            </h2>
          </div>
          <p className="max-w-sm text-right text-sm leading-6 text-white/56">
            Flare markers scale by class, CME bars by analyzed speed, and storm markers by peak Kp.
          </p>
        </div>
        <SpaceWeatherTimeline
          cmes={summary.cmes}
          flares={summary.flares}
          rangeEnd={rangeEnd}
          rangeDays={windowDays}
          rangeStart={rangeStart}
          storms={summary.storms}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="surface px-6 py-6">
          <p className="section-label">Latest flares</p>
          <div className="mt-4 space-y-4">
            {summary.flares.slice(0, 8).map((flare) => (
              <div key={flare.id} className="border-b border-white/8 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-lg font-medium text-white">{flare.classType}</p>
                  <p className="text-sm text-white/46">{formatTimestamp(flare.beginTime)}</p>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {flare.activeRegion}
                  {flare.sourceLocation ? ` · ${flare.sourceLocation}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">Latest CMEs</p>
          <div className="mt-4 space-y-4">
            {summary.cmes.slice(0, 8).map((cme) => (
              <div key={cme.id} className="border-b border-white/8 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-lg font-medium text-white">{cme.type ?? "Unclassified"} CME</p>
                  <p className="text-sm text-white/46">{formatTimestamp(cme.startTime)}</p>
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {cme.speed ? `${Math.round(cme.speed)} km/s` : "Speed unavailable"}
                  {cme.longitude !== null && cme.latitude !== null
                    ? ` · ${cme.longitude.toFixed(0)} / ${cme.latitude.toFixed(0)}`
                    : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">Geomagnetic storms</p>
          <div className="mt-4 space-y-4">
            {summary.storms.length ? (
              summary.storms.slice(0, 8).map((storm) => (
                <div key={storm.id} className="border-b border-white/8 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-lg font-medium text-white">Kp {storm.maxKpIndex ?? "?"}</p>
                    <p className="text-sm text-white/46">{formatTimestamp(storm.startTime)}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/60">{storm.readings.length} NOAA readings</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/56">No geomagnetic storms in this time window.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
