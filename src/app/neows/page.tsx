import type { Metadata } from "next";
import { getNeoFeed } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "NeoWs | NASA Signal Desk",
  description: "Near-Earth object feed with closest approaches and hazard summary.",
};

function formatDistanceLunar(value: number) {
  return `${value.toFixed(1)} LD`;
}

export default async function NeoWsPage() {
  const feed = await getNeoFeed(2);
  const hazardousCount = feed.approaches.filter((item) => item.hazardous).length;
  const closest = feed.approaches[0];
  const fastest = [...feed.approaches].sort(
    (left, right) => right.relativeVelocityKps - left.relativeVelocityKps,
  )[0];
  const chartItems = feed.approaches.slice(0, 8);
  const maxLunarDistance = Math.max(...chartItems.map((item) => item.lunarDistance), 1);

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Asteroids NeoWs</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Near-Earth objects ranked by how close they pass, not buried in raw feed JSON.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              The bar view compares closest lunar miss distances over the current two-day window,
              which is usually the first thing you want to scan.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Window</p>
              <p className="mt-3 text-base text-white">
                {feed.range.startDate} to {feed.range.endDate}
              </p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Objects</p>
              <p className="metric-value mt-3 text-white">{feed.elementCount}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Potentially hazardous</p>
              <p className="metric-value mt-3 text-white">{hazardousCount}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Closest pass</p>
              <p className="mt-3 text-base text-white">
                {closest ? formatDistanceLunar(closest.lunarDistance) : "Unavailable"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Closest approaches</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Lunar-distance comparison
            </h2>
          </div>
          <p className="text-sm text-white/56">
            Lower bars mean closer passes. Hazardous objects are marked in amber.
          </p>
        </div>
        <div className="mt-5 space-y-4">
          {chartItems.map((item) => (
            <div key={item.id} className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_110px] sm:items-center">
              <div>
                <p className="text-base font-medium text-white">{item.name}</p>
                <p className="mt-1 text-sm text-white/52">
                  {item.hazardous ? "Potentially hazardous" : "Not flagged hazardous"}
                </p>
              </div>
              <div className="h-3 bg-white/8">
                <div
                  className={`h-full ${item.hazardous ? "bg-[#f2b05d]" : "bg-[#7cc4ff]"}`}
                  style={{ width: `${Math.max(4, (item.lunarDistance / maxLunarDistance) * 100)}%` }}
                />
              </div>
              <p className="text-sm text-white/62">{formatDistanceLunar(item.lunarDistance)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.1fr)_120px_120px_120px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Object</p>
          <p>Miss distance</p>
          <p>Speed</p>
          <p>Size</p>
        </div>
        {feed.approaches.slice(0, 16).map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,1.1fr)_120px_120px_120px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{item.name}</p>
              <p className="mt-1 text-white/54">
                H {item.absoluteMagnitude}
                {item.hazardous ? " · hazardous" : ""}
              </p>
            </div>
            <p className="text-white/62">{formatDistanceLunar(item.lunarDistance)}</p>
            <p className="text-white/62">{item.relativeVelocityKps.toFixed(1)} km/s</p>
            <p className="text-white/62">
              {item.estimatedDiameterMaxMeters
                ? `${Math.round(item.estimatedDiameterMaxMeters)} m`
                : "n/a"}
            </p>
          </div>
        ))}
        <div className="px-6 py-5 text-sm text-white/56 sm:px-8">
          Fastest object in this window:{" "}
          <span className="text-white">
            {fastest ? `${fastest.name} at ${fastest.relativeVelocityKps.toFixed(1)} km/s` : "Unavailable"}
          </span>
        </div>
      </section>
    </main>
  );
}
