import Link from "next/link";
import ApodExperience from "@/components/apod-experience";
import { getBuiltApis, getPlaceholderApis } from "@/lib/nasa-catalog";

type HomePageProps = {
  searchParams: Promise<{ count?: string; date?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const liveViews = getBuiltApis().filter((view) => view.slug !== "apod");
  const placeholders = getPlaceholderApis();
  const resolvedSearchParams = await searchParams;

  return (
    <main className="space-y-8">
      <ApodExperience basePath="/" mode="landing" searchParams={resolvedSearchParams} />
      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Mission Desk</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              More live views beyond APOD
            </h2>
          </div>
          <p className="text-sm text-white/50">{liveViews.length + 1} live pages</p>
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
        {placeholders.length ? (
          placeholders.slice(0, 5).map((view) => (
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
          ))
        ) : (
          <div className="px-6 py-5 sm:px-8">
            <p className="section-label">Catalog status</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              All NASA catalog routes are live now.
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/60">
              The landing page no longer has a placeholder queue because every tracked surface has a
              dedicated route.
            </p>
          </div>
        )}
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
              Browse every live route in one place.
            </p>
          </div>
          <span className="text-sm text-white/46">Open catalog</span>
        </Link>
      </section>
    </main>
  );
}
