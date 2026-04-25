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
  const primaryViews = liveViews.slice(0, 8);

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Mission overview</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-medium tracking-[-0.08em] text-white sm:text-6xl">
            A clean desk for NASA signals that are worth checking now.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="nav-chip" href="/catalog">
            All data views
          </Link>
          <Link className="nav-chip" href="/images">
            Search media
          </Link>
        </div>
      </section>

      <ApodExperience basePath="/" mode="landing" searchParams={resolvedSearchParams} />

      <section className="surface px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-label">Live data views</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white sm:text-3xl">
              Jump straight to the signal you need.
            </h2>
          </div>
          <p className="font-mono text-sm text-white/50">{liveViews.length + 1} live pages</p>
        </div>
        <div className="mt-5">
          {primaryViews.map((view) => (
            <Link
              key={view.slug}
              href={`/${view.slug}`}
              className="simple-row transition hover:bg-white/[0.025] sm:px-2"
            >
              <div>
                <p className="text-xl font-medium tracking-[-0.05em] text-white">{view.title}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-white/42">
                  {view.source}
                </p>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/62">{view.summary}</p>
              <span className="status-pill w-fit">Live</span>
              <span className="font-mono text-sm text-white/46">Open</span>
            </Link>
          ))}
        </div>
        {liveViews.length > primaryViews.length ? (
          <div className="mt-5 border-t border-white/10 pt-5">
            <Link className="nav-chip" href="/catalog">
              View {liveViews.length - primaryViews.length} more
            </Link>
          </div>
        ) : null}
      </section>

      <section className="surface divide-y divide-white/10 overflow-hidden">
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
          <p className="section-label">Reference</p>
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.06em] text-white">
              Full NASA API map
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/60">
              Every route, source, and next planned improvement in one compact index.
            </p>
          </div>
          <span className="text-sm text-white/46">Open catalog</span>
        </Link>
      </section>
    </main>
  );
}
