import type { Metadata } from "next";
import { getSscSnapshot, type SscTrackView } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "SSC | NASA Signal Desk",
  description: "Satellite Situation Center observatory coverage with paired orbit-track sampling.",
};

function formatDistance(value: number | null) {
  return value === null ? "Unavailable" : `${Math.round(value).toLocaleString("en-US")} km`;
}

function formatTime(value: string | null) {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function TrackPlot({ tracks }: { tracks: SscTrackView[] }) {
  const width = 760;
  const height = 380;
  const allPoints = tracks.flatMap((track) => track.points);

  if (!allPoints.length) {
    return (
      <div className="flex aspect-[2/1] items-center justify-center text-sm text-white/46">
        No track data available for the current window.
      </div>
    );
  }

  const xValues = allPoints.map((point) => point.x);
  const yValues = allPoints.map((point) => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const colors = ["#7cc4ff", "#f2b05d"];

  function getX(value: number) {
    return 60 + ((value - minX) / Math.max(maxX - minX, 1)) * (width - 120);
  }

  function getY(value: number) {
    return height - 40 - ((value - minY) / Math.max(maxY - minY, 1)) * (height - 80);
  }

  return (
    <svg aria-label="SSC paired track plot" className="h-auto w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
      <rect fill="rgba(255,255,255,0.02)" height={height} width={width} />
      <line stroke="rgba(255,255,255,0.12)" x1="60" x2={width - 40} y1={height / 2} y2={height / 2} />
      <line stroke="rgba(255,255,255,0.12)" x1={width / 2} x2={width / 2} y1="20" y2={height - 40} />
      {tracks.map((track, index) => {
        const path = track.points
          .map((point, pointIndex) => `${pointIndex === 0 ? "M" : "L"} ${getX(point.x)} ${getY(point.y)}`)
          .join(" ");

        return (
          <g key={track.id}>
            <path d={path} fill="none" opacity="0.92" stroke={colors[index % colors.length]} strokeWidth="2.5" />
            {track.points[0] ? (
              <circle cx={getX(track.points[0].x)} cy={getY(track.points[0].y)} fill={colors[index % colors.length]} r="4.5" />
            ) : null}
            {track.points.at(-1) ? (
              <circle
                cx={getX(track.points.at(-1)?.x ?? 0)}
                cy={getY(track.points.at(-1)?.y ?? 0)}
                fill={colors[index % colors.length]}
                r="7"
              />
            ) : null}
          </g>
        );
      })}
      <text fill="rgba(255,255,255,0.42)" fontSize="12" x="60" y="18">
        +Y
      </text>
      <text fill="rgba(255,255,255,0.42)" fontSize="12" x={width - 68} y={height / 2 - 8}>
        +X
      </text>
      <text fill="rgba(255,255,255,0.42)" fontSize="12" x="18" y={height / 2 - 8}>
        -X
      </text>
      <text fill="rgba(255,255,255,0.42)" fontSize="12" x={width / 2 + 8} y={height - 10}>
        -Y
      </text>
    </svg>
  );
}

export default async function SscPage() {
  let snapshot: Awaited<ReturnType<typeof getSscSnapshot>> | null = null;

  try {
    snapshot = await getSscSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">Satellite Situation Center</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            SSC data is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The observatory catalog or orbit-track query did not complete during this render.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Satellite Situation Center</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Mission coverage and orbital context from SSC, reduced to one paired track you can actually read.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              SSC exposes a huge observatory catalog, so this page highlights a small mission set
              and then plots a six-hour GSE track for the current THEMIS pair instead of dumping raw
              service responses.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Featured missions</p>
              <p className="metric-value mt-3 text-white">{snapshot.featuredObservatories.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Track series</p>
              <p className="metric-value mt-3 text-white">{snapshot.tracks.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Window start</p>
              <p className="mt-3 text-base text-white">{formatTime(snapshot.queryWindowStart)}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Window end</p>
              <p className="mt-3 text-base text-white">{formatTime(snapshot.queryWindowEnd)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface overflow-hidden px-4 py-4 sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Paired track</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                {snapshot.pairLabel}
              </h2>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-white/56">
              The projection uses SSC&apos;s live GSE X/Y coordinates for the selected six-hour window.
            </p>
          </div>
          <TrackPlot tracks={snapshot.tracks} />
        </div>

        <aside className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Coverage shortlist</p>
          <div className="mt-4 space-y-3">
            {snapshot.featuredObservatories.map((item) => (
              <div key={item.id} className="border-b border-white/8 pb-3">
                <p className="text-base font-medium text-white">{item.name}</p>
                <p className="mt-1 text-sm text-white/54">
                  {item.id} · {item.resolutionSeconds ?? "?"} second cadence
                </p>
                <p className="mt-2 text-sm text-white/52">
                  {formatTime(item.startTime)} to {formatTime(item.endTime)}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_150px_150px_120px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Track</p>
          <p>Start radius</p>
          <p>End radius</p>
          <p>Samples</p>
        </div>
        {snapshot.tracks.map((track) => (
          <div
            key={track.id}
            className="grid grid-cols-[minmax(0,1fr)_150px_150px_120px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{track.name}</p>
              <p className="mt-1 text-white/54">
                {track.coordinateSystem} · {formatTime(track.startTime)} to {formatTime(track.endTime)}
              </p>
            </div>
            <p className="text-white/62">{formatDistance(track.startDistanceKm)}</p>
            <p className="text-white/62">{formatDistance(track.endDistanceKm)}</p>
            <p className="text-white/62">{track.sampleCount}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
