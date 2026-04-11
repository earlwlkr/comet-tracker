import type { Metadata } from "next";
import Link from "next/link";
import { getEonetEvents, type EonetEventView } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "EONET | NASA Signal Desk",
  description: "Open Earth events with category filters and a coordinate plot.",
};

type EonetPageProps = {
  searchParams: Promise<{ category?: string }>;
};

const categoryColors: Record<string, string> = {
  drought: "#d7b05c",
  floods: "#67b8ff",
  severeStorms: "#f68d6f",
  volcanoes: "#ff6d5b",
  wildfires: "#ffb000",
};

function getCategoryColor(categoryId: string) {
  return categoryColors[categoryId] ?? "#9ec5ff";
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value));
}

function hoursSince(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60)));
}

function buildCategoryCounts(events: EonetEventView[]) {
  const counts = new Map<string, { count: number; label: string }>();

  for (const event of events) {
    event.categoryIds.forEach((categoryId, index) => {
      const current = counts.get(categoryId);
      const label = event.categoryLabel.split(", ")[index] ?? categoryId;
      counts.set(categoryId, { count: (current?.count ?? 0) + 1, label });
    });
  }

  return [...counts.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((left, right) => right.count - left.count);
}

function WorldPlot({ events }: { events: EonetEventView[] }) {
  const width = 720;
  const height = 360;

  return (
    <svg
      aria-label="Open EONET event plot"
      className="h-auto w-full"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      <rect fill="rgba(255,255,255,0.02)" height={height} width={width} />
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={`h-${ratio}`}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 8"
          x1="0"
          x2={width}
          y1={height * ratio}
          y2={height * ratio}
        />
      ))}
      {[0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={`v-${ratio}`}
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="4 8"
          x1={width * ratio}
          x2={width * ratio}
          y1="0"
          y2={height}
        />
      ))}
      {events.map((event) => {
        if (!event.coordinates) {
          return null;
        }

        const x = ((event.coordinates.longitude + 180) / 360) * width;
        const y = ((90 - event.coordinates.latitude) / 180) * height;
        const primaryCategory = event.categoryIds[0] ?? "unknown";

        return (
          <g key={event.id}>
            <circle
              cx={x}
              cy={y}
              fill={getCategoryColor(primaryCategory)}
              fillOpacity="0.18"
              r="13"
            />
            <circle cx={x} cy={y} fill={getCategoryColor(primaryCategory)} r="4" />
          </g>
        );
      })}
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x="8" y="18">
        90°N
      </text>
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x="8" y={height / 2 + 4}>
        Equator
      </text>
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x="8" y={height - 8}>
        90°S
      </text>
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x="8" y={height - 18}>
        180°W
      </text>
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x={width / 2 - 14} y={height - 18}>
        0°
      </text>
      <text fill="rgba(255,255,255,0.44)" fontSize="12" x={width - 46} y={height - 18}>
        180°E
      </text>
    </svg>
  );
}

export default async function EonetPage({ searchParams }: EonetPageProps) {
  const { category } = await searchParams;
  const events = await getEonetEvents();
  const categoryCounts = buildCategoryCounts(events);
  const filteredEvents = category ? events.filter((event) => event.categoryIds.includes(category)) : events;
  const plottedEvents = filteredEvents.filter((event) => event.coordinates);
  const updatedLastDay = filteredEvents.filter((event) => hoursSince(event.latestDate) <= 24).length;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Earth Observatory Natural Event Tracker</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-3xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Open Earth events, filtered down to what is still active.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              The plot uses raw latitude and longitude from EONET&apos;s latest event geometry, so it
              works as a quick clustering view rather than an ornamental map.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Open events</p>
              <p className="metric-value mt-3 text-white">{filteredEvents.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Updated 24h</p>
              <p className="metric-value mt-3 text-white">{updatedLastDay}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Categories</p>
              <p className="metric-value mt-3 text-white">{categoryCounts.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">With coordinates</p>
              <p className="metric-value mt-3 text-white">{plottedEvents.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-2">
          <Link className={`nav-chip ${!category ? "bg-white/[0.08] text-white" : ""}`} href="/eonet">
            All categories
          </Link>
          {categoryCounts.map((item) => (
            <Link
              key={item.id}
              className={`nav-chip ${category === item.id ? "bg-white/[0.08] text-white" : ""}`}
              href={`/eonet?category=${item.id}`}
            >
              {item.label} · {item.count}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface overflow-hidden px-4 py-4 sm:px-6">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Coordinate plot</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                Where active events are clustering
              </h2>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-white/56">
              Dots use the first listed event category for color and the latest available geometry
              for placement.
            </p>
          </div>
          <WorldPlot events={plottedEvents} />
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">Category legend</p>
          <div className="mt-4 space-y-3">
            {categoryCounts.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/8 pb-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(item.id) }}
                  />
                  <p className="text-sm text-white">{item.label}</p>
                </div>
                <p className="text-sm text-white/56">{item.count} open</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1.2fr)_180px_110px_120px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Event</p>
          <p>Latest update</p>
          <p>Age</p>
          <p>Sources</p>
        </div>
        <div>
          {filteredEvents.slice(0, 18).map((event) => (
            <div
              key={event.id}
              className="grid grid-cols-[minmax(0,1.2fr)_180px_110px_120px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
            >
              <div>
                <p className="text-base font-medium text-white">{event.title}</p>
                <p className="mt-1 text-white/54">{event.categoryLabel}</p>
                {event.coordinates ? (
                  <p className="mt-2 font-mono text-xs text-white/42">
                    {event.coordinates.latitude.toFixed(1)}°, {event.coordinates.longitude.toFixed(1)}°
                  </p>
                ) : null}
              </div>
              <p className="text-white/62">{formatEventTime(event.latestDate)}</p>
              <p className="text-white/62">{hoursSince(event.latestDate)}h ago</p>
              <div className="space-y-2">
                <p className="text-white/62">{event.sourceCount}</p>
                {event.sources[0] ? (
                  <a
                    className="data-link text-xs"
                    href={event.sources[0].url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Primary link
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
