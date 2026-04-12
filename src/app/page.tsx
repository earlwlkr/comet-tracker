import Link from "next/link";
import { getBuiltApis, getPlaceholderApis } from "@/lib/nasa-catalog";

export default function HomePage() {
  const liveViews = getBuiltApis();
  const placeholders = getPlaceholderApis();

  return (
    <main className="space-y-8">
      <section className="surface px-6 py-8 sm:px-8 sm:py-10">
        <p className="section-label">Mission Desk</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <h1 className="max-w-3xl text-4xl font-medium tracking-[-0.08em] text-white sm:text-6xl">
              A working NASA API desk, with live views where the data already
              has a useful shape.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/64 sm:text-base">
              Nine APIs are now built out with real data views, and the rest
              still have placeholder pages so the catalog reads like a planned
              system instead of a loose set of links.
            </p>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Live views</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Built against working data
            </h2>
          </div>
          <p className="text-sm text-white/50">{liveViews.length} live pages</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {liveViews.map((view) => (
            <Link
              key={view.slug}
              href={`/${view.slug}`}
              className="border border-white/10 px-5 py-5 transition hover:bg-white/[0.035]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">{view.source}</p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                    {view.title}
                  </h3>
                </div>
                <span className="border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Live
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
                {view.summary}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface divide-y divide-white/10">
        {placeholders.slice(0, 5).map((view) => (
          <Link
            key={view.slug}
            href={`/${view.slug}`}
            className="grid gap-3 px-6 py-5 transition hover:bg-white/[0.035] sm:grid-cols-[220px_1fr_auto] sm:items-end sm:px-8"
          >
            <p className="section-label">{view.source}</p>
            <div>
              <h2 className="text-2xl font-medium tracking-[-0.06em] text-white">
                {view.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white/60">
                {view.summary}
              </p>
            </div>
            <span className="text-sm text-white/46">Placeholder</span>
          </Link>
        ))}
        <Link
          href="/catalog"
          className="grid gap-3 px-6 py-5 transition hover:bg-white/[0.035] sm:grid-cols-[220px_1fr_auto] sm:items-end sm:px-8"
        >
          <p className="section-label">Catalog</p>
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.06em] text-white">
              See the full NASA API map
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/60">
              Browse all live and placeholder pages in one place.
            </p>
          </div>
          <span className="text-sm text-white/46">Open catalog</span>
        </Link>
      </section>
    </main>
  );
}
