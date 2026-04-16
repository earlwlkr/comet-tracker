import type { Metadata } from "next";
import { getSsdCneosSnapshot } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "SSD/CNEOS | NASA Signal Desk",
  description: "Upcoming close approaches from JPL's SSD/CNEOS close-approach API.",
};

function formatDistanceAu(value: number | null) {
  return value === null ? "Unavailable" : `${value.toFixed(5)} au`;
}

function formatDistanceLunar(value: number | null) {
  return value === null ? "Unavailable" : `${value.toFixed(1)} LD`;
}

export default async function SsdCneosPage() {
  let snapshot: Awaited<ReturnType<typeof getSsdCneosSnapshot>> | null = null;

  try {
    snapshot = await getSsdCneosSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">SSD / CNEOS</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            Close-approach data is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            JPL&apos;s close-approach feed did not return during this render window.
          </p>
        </section>
      </main>
    );
  }

  const nearest = snapshot.approaches[0];
  const fastest = [...snapshot.approaches].sort(
    (left, right) => (right.relativeVelocityKps ?? 0) - (left.relativeVelocityKps ?? 0),
  )[0];
  const brightest = [...snapshot.approaches].sort(
    (left, right) => (left.hMagnitude ?? 99) - (right.hMagnitude ?? 99),
  )[0];
  const maxDistance = Math.max(
    ...snapshot.approaches.map((item) => item.distanceLunar ?? 0),
    1,
  );

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Solar System Dynamics / CNEOS</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              JPL close approaches beyond NeoWs, ordered for scanning rather than left as a field array.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              This route reads the SSD close-approach API directly and surfaces the next near passes
              inside a six-month window, with distance in both astronomical units and lunar
              distances so the scale is easier to interpret.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Approaches</p>
              <p className="metric-value mt-3 text-white">{snapshot.approaches.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Nearest object</p>
              <p className="mt-3 text-base text-white">{nearest?.designation ?? "Unavailable"}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Fastest</p>
              <p className="mt-3 text-base text-white">
                {fastest?.relativeVelocityKps ? `${fastest.relativeVelocityKps.toFixed(1)} km/s` : "Unavailable"}
              </p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Brightest H</p>
              <p className="mt-3 text-base text-white">
                {brightest?.hMagnitude ? brightest.hMagnitude.toFixed(1) : "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Distance comparison</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Lunar-distance bar view
            </h2>
          </div>
          <p className="text-sm text-white/56">
            Window: {snapshot.queryWindowStart} to {snapshot.queryWindowEnd}
          </p>
        </div>
        <div className="mt-5 space-y-4">
          {snapshot.approaches.slice(0, 8).map((item) => (
            <div key={`${item.designation}-${item.approachDate}`} className="grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)_110px] sm:items-center">
              <div>
                <p className="text-base font-medium text-white">{item.designation}</p>
                <p className="mt-1 text-sm text-white/52">{item.approachDate}</p>
              </div>
              <div className="h-3 bg-white/8">
                <div
                  className="h-full bg-[#7cc4ff]"
                  style={{
                    width: `${Math.max(4, ((item.distanceLunar ?? 0) / maxDistance) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-sm text-white/62">{formatDistanceLunar(item.distanceLunar)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_130px_120px_110px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Object</p>
          <p>Miss distance</p>
          <p>Velocity</p>
          <p>H</p>
        </div>
        {snapshot.approaches.map((item) => (
          <div
            key={`${item.designation}-${item.approachDate}-row`}
            className="grid grid-cols-[minmax(0,1fr)_130px_120px_110px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{item.designation}</p>
              <p className="mt-1 text-white/54">
                {item.approachDate}
                {item.orbitId ? ` · orbit ${item.orbitId}` : ""}
              </p>
              <p className="mt-2 text-white/42">{item.missDistanceRangeAu ?? "No range published"}</p>
            </div>
            <p className="text-white/62">
              {formatDistanceAu(item.distanceAu)}
              <br />
              <span className="text-white/42">{formatDistanceLunar(item.distanceLunar)}</span>
            </p>
            <p className="text-white/62">
              {item.relativeVelocityKps ? `${item.relativeVelocityKps.toFixed(1)} km/s` : "n/a"}
            </p>
            <p className="text-white/62">
              {item.hMagnitude ? item.hMagnitude.toFixed(1) : "n/a"}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
