import type { Metadata } from "next";
import { getInsightWeather, type InsightSolView } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "Insight | NASA Signal Desk",
  description: "Final published InSight Mars weather archive with sol trends and station readings.",
};

function formatUtcDay(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function formatTemperature(value: number | null) {
  return value === null ? "n/a" : `${value.toFixed(1)} C`;
}

function formatPressure(value: number | null) {
  return value === null ? "n/a" : `${value.toFixed(1)} Pa`;
}

function formatWind(value: number | null) {
  return value === null ? "n/a" : `${value.toFixed(1)} m/s`;
}

function Sparkline({
  color,
  values,
}: {
  color: string;
  values: Array<number | null>;
}) {
  const numericValues = values.filter((value): value is number => value !== null);
  const width = 240;
  const height = 90;

  if (!numericValues.length) {
    return (
      <div className="flex h-[90px] items-center justify-center text-sm text-white/44">
        No recent values
      </div>
    );
  }

  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      if (value === null) {
        return null;
      }

      const x = (index / Math.max(values.length - 1, 1)) * (width - 24) + 12;
      const y = height - 12 - ((value - min) / range) * (height - 24);
      return `${x},${y}`;
    })
    .filter((value): value is string => Boolean(value))
    .join(" ");

  return (
    <svg aria-label="Trend sparkline" className="h-auto w-full" role="img" viewBox={`0 0 ${width} ${height}`}>
      <rect fill="rgba(255,255,255,0.02)" height={height} width={width} />
      <polyline fill="none" points={points} stroke={color} strokeWidth="3" />
      {values.map((value, index) => {
        if (value === null) {
          return null;
        }

        const x = (index / Math.max(values.length - 1, 1)) * (width - 24) + 12;
        const y = height - 12 - ((value - min) / range) * (height - 24);

        return <circle key={`${index}-${value}`} cx={x} cy={y} fill={color} r="3.5" />;
      })}
    </svg>
  );
}

function SolTableRow({ sol }: { sol: InsightSolView }) {
  return (
    <div className="grid gap-4 border-b border-white/8 px-6 py-5 text-sm sm:grid-cols-[110px_140px_140px_140px_120px_130px] sm:px-8">
      <div>
        <p className="text-base font-medium text-white">Sol {sol.sol}</p>
        <p className="mt-1 text-white/46">{formatUtcDay(sol.lastUtc)}</p>
      </div>
      <p className="text-white/62">{formatTemperature(sol.averageTempC)}</p>
      <p className="text-white/62">{formatPressure(sol.averagePressurePa)}</p>
      <p className="text-white/62">{formatWind(sol.averageWindMps)}</p>
      <p className="text-white/62">{sol.mostCommonWindDirection ?? "n/a"}</p>
      <p className="text-white/62">{sol.northernSeason ?? sol.season ?? "n/a"}</p>
    </div>
  );
}

export default async function InsightPage() {
  let weather: Awaited<ReturnType<typeof getInsightWeather>> | null = null;

  try {
    weather = await getInsightWeather();
  } catch {
    weather = null;
  }

  if (!weather) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">InSight Mars Weather Archive</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            The InSight archive is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            NASA&apos;s archived weather feed did not respond reliably enough for this render. The route will recover automatically on the next successful fetch.
          </p>
        </section>
      </main>
    );
  }

  const latestSol = weather.latestSol;

  if (!latestSol) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">Insight</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            InSight Mars Weather
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The archived weather feed is temporarily unavailable from NASA right now.
          </p>
        </section>
      </main>
    );
  }

  const firstSol = weather.sols[0];
  const lastSol = weather.sols.at(-1) ?? latestSol;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">InSight Mars Weather Archive</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              The final published InSight weather window, framed as an archive read instead of pretending it is current Mars weather.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              NASA&apos;s public feed ends with sols {firstSol?.sol ?? "?"} to {lastSol.sol}, covering{" "}
              {formatUtcDay(firstSol?.firstUtc ?? latestSol.firstUtc)} through {formatUtcDay(lastSol.lastUtc)}. That makes this page most useful as a compact final station log rather than a live mission dashboard.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Archive span</p>
              <p className="metric-value mt-3 text-white">{weather.sols.length} sols</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Latest sol</p>
              <p className="metric-value mt-3 text-white">{latestSol.sol}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Avg temperature</p>
              <p className="mt-3 text-base text-white">{formatTemperature(latestSol.averageTempC)}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Avg pressure</p>
              <p className="mt-3 text-base text-white">{formatPressure(latestSol.averagePressurePa)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="surface px-6 py-6">
          <p className="section-label">Temperature</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Average by sol
          </h2>
          <div className="mt-5">
            <Sparkline color="#ff9f6b" values={weather.sols.map((sol) => sol.averageTempC)} />
          </div>
          <p className="mt-4 text-sm text-white/56">
            Latest range: <span className="text-white">{formatTemperature(latestSol.minTempC)} to {formatTemperature(latestSol.maxTempC)}</span>
          </p>
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">Pressure</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Average by sol
          </h2>
          <div className="mt-5">
            <Sparkline color="#7cc4ff" values={weather.sols.map((sol) => sol.averagePressurePa)} />
          </div>
          <p className="mt-4 text-sm text-white/56">
            Latest range: <span className="text-white">{formatPressure(latestSol.minPressurePa)} to {formatPressure(latestSol.maxPressurePa)}</span>
          </p>
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">Wind</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Average by sol
          </h2>
          <div className="mt-5">
            <Sparkline color="#d7b05c" values={weather.sols.map((sol) => sol.averageWindMps)} />
          </div>
          <p className="mt-4 text-sm text-white/56">
            Latest direction: <span className="text-white">{latestSol.mostCommonWindDirection ?? "Unavailable"}</span>
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="surface px-6 py-6">
          <p className="section-label">Latest read</p>
          <div className="mt-4 space-y-4">
            <div className="border-b border-white/8 pb-4">
              <p className="text-lg font-medium text-white">Season</p>
              <p className="mt-2 text-sm text-white/60">
                {latestSol.season ?? "Unknown"}
                {latestSol.northernSeason ? ` · north ${latestSol.northernSeason}` : ""}
                {latestSol.southernSeason ? ` · south ${latestSol.southernSeason}` : ""}
              </p>
            </div>
            <div className="border-b border-white/8 pb-4">
              <p className="text-lg font-medium text-white">Observation window</p>
              <p className="mt-2 text-sm text-white/60">
                {formatUtcDay(latestSol.firstUtc)} to {formatUtcDay(latestSol.lastUtc)}
              </p>
            </div>
            <div className="border-b border-white/8 pb-4">
              <p className="text-lg font-medium text-white">Average wind</p>
              <p className="mt-2 text-sm text-white/60">{formatWind(latestSol.averageWindMps)}</p>
            </div>
            <div>
              <p className="text-lg font-medium text-white">Peak wind</p>
              <p className="mt-2 text-sm text-white/60">{formatWind(latestSol.maxWindMps)}</p>
            </div>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="grid gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:grid-cols-[110px_140px_140px_140px_120px_130px] sm:px-8">
            <p>Sol</p>
            <p>Avg temp</p>
            <p>Avg pressure</p>
            <p>Avg wind</p>
            <p>Wind dir</p>
            <p>Season</p>
          </div>
          {weather.sols.map((sol) => (
            <SolTableRow key={sol.sol} sol={sol} />
          ))}
        </div>
      </section>
    </main>
  );
}
