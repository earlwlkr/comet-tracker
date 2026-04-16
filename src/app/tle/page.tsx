import type { Metadata } from "next";
import Link from "next/link";
import { getTleSnapshot } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "TLE | NASA Signal Desk",
  description: "Latest two-line element records for a selected object search.",
};

type TlePageProps = {
  searchParams: Promise<{ search?: string }>;
};

const suggestionQueries = ["iss", "starlink", "noaa", "cubesat"];

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

export default async function TlePage({ searchParams }: TlePageProps) {
  const { search } = await searchParams;
  let snapshot: Awaited<ReturnType<typeof getTleSnapshot>> | null = null;

  try {
    snapshot = await getTleSnapshot(search ?? "iss");
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">Two-Line Element API</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            TLE data is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The current TLE query did not return during this render window.
          </p>
        </section>
      </main>
    );
  }

  const freshest = snapshot.records[0];

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Two-Line Element API</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Fresh orbital elements for one search term, surfaced as a usable watchlist.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              The TLE service is most useful when you want the latest epoch and the exact line pair
              for a known object family, not a blank page about future pass prediction ideas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Search</p>
              <p className="mt-3 text-base text-white">{snapshot.query}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Matches</p>
              <p className="metric-value mt-3 text-white">{snapshot.totalItems}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Freshest epoch</p>
              <p className="mt-3 text-base text-white">
                {freshest ? `${freshest.ageHours}h old` : "Unavailable"}
              </p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Records shown</p>
              <p className="metric-value mt-3 text-white">{snapshot.records.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-2">
          {suggestionQueries.map((item) => (
            <Link
              key={item}
              className={`nav-chip ${snapshot.query === item ? "bg-white/[0.08] text-white" : ""}`}
              href={`/tle?search=${item}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      {freshest ? (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="surface px-6 py-6 sm:px-8">
            <p className="section-label">Freshest record</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              {freshest.name}
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="section-label">Satellite id</p>
                <p className="mt-2 text-white">{freshest.satelliteId}</p>
              </div>
              <div>
                <p className="section-label">Epoch</p>
                <p className="mt-2 text-white">{formatTime(freshest.date)}</p>
              </div>
              <div>
                <p className="section-label">Age</p>
                <p className="mt-2 text-white">{freshest.ageHours} hours</p>
              </div>
            </div>
          </aside>

          <div className="surface px-6 py-6 sm:px-8">
            <p className="section-label">Element lines</p>
            <pre className="mt-4 overflow-x-auto border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/76">
              {freshest.line1}
              {"\n"}
              {freshest.line2}
            </pre>
          </div>
        </section>
      ) : null}

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_170px_90px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Object</p>
          <p>Epoch</p>
          <p>Age</p>
        </div>
        {snapshot.records.map((record) => (
          <div
            key={`${record.satelliteId}-${record.date}`}
            className="grid grid-cols-[minmax(0,1fr)_170px_90px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{record.name}</p>
              <p className="mt-1 text-white/54">NORAD {record.satelliteId}</p>
              <p className="mt-2 break-all font-mono text-xs text-white/42">{record.line2}</p>
            </div>
            <p className="text-white/62">{formatTime(record.date)}</p>
            <p className="text-white/62">{record.ageHours}h</p>
          </div>
        ))}
      </section>
    </main>
  );
}
