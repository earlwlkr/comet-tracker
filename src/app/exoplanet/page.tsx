import type { Metadata } from "next";
import { getExoplanetSnapshot } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "Exoplanet | NASA Signal Desk",
  description: "Recent exoplanet discoveries and discovery-method summary.",
};

function formatDistance(value: number | null) {
  return value === null ? "Unknown" : `${value.toFixed(0)} pc`;
}

export default async function ExoplanetPage() {
  const snapshot = await getExoplanetSnapshot();
  const strongestMethodCount = Math.max(...snapshot.methodCounts.map((item) => item.count), 1);
  const latestYear = Math.max(
    ...snapshot.recentPlanets.map((planet) => planet.discoveryYear ?? 0),
    0,
  );

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Exoplanet Archive</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Exoplanet data trimmed to two useful questions: what was found recently, and how was it found?
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              The method chart comes from the recent sample shown below, so the visual and table stay
              in sync instead of summarizing a completely different dataset.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Recent sample</p>
              <p className="metric-value mt-3 text-white">{snapshot.recentPlanets.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Nearest sample</p>
              <p className="metric-value mt-3 text-white">{snapshot.nearestPlanets.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Latest discovery year</p>
              <p className="metric-value mt-3 text-white">{latestYear}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Methods on page</p>
              <p className="metric-value mt-3 text-white">{snapshot.methodCounts.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface px-6 py-6">
          <p className="section-label">Discovery methods</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Share of the recent sample
          </h2>
          <div className="mt-5 space-y-4">
            {snapshot.methodCounts.map((item) => (
              <div key={item.method} className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)_40px] sm:items-center">
                <p className="text-sm text-white/62">{item.method}</p>
                <div className="h-3 bg-white/8">
                  <div
                    className="h-full bg-[#7cc4ff]"
                    style={{ width: `${(item.count / strongestMethodCount) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-white">{item.count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="border-b border-white/10 px-6 py-4 sm:px-8">
            <p className="section-label">Recent discoveries</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Latest planets in the current sample
            </h2>
          </div>
          {snapshot.recentPlanets.slice(0, 12).map((planet) => (
            <div
              key={planet.name}
              className="grid gap-4 border-b border-white/8 px-6 py-5 text-sm sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:px-8"
            >
              <div>
                <p className="text-base font-medium text-white">{planet.name}</p>
                <p className="mt-1 text-white/54">
                  {planet.hostName} · {planet.discoveryMethod}
                </p>
              </div>
              <p className="text-white/62">{planet.discoveryYear ?? "Unknown year"}</p>
              <p className="text-white/62">
                {planet.radiusEarths ? `${planet.radiusEarths.toFixed(1)} R⊕` : "radius n/a"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 sm:px-8">
          <p className="section-label">Nearby systems</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Closest planets in the archive sample
          </h2>
        </div>
        {snapshot.nearestPlanets.map((planet) => (
          <div
            key={`${planet.name}-nearby`}
            className="grid gap-4 border-b border-white/8 px-6 py-5 text-sm sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{planet.name}</p>
              <p className="mt-1 text-white/54">
                {planet.hostName} · {planet.discoveryMethod}
              </p>
            </div>
            <p className="text-white/62">{formatDistance(planet.systemDistanceParsecs)}</p>
            <p className="text-white/62">
              {planet.massEarths ? `${planet.massEarths.toFixed(1)} M⊕` : "mass n/a"}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
