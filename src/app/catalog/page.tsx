import type { Metadata } from "next";
import Link from "next/link";
import { getBuiltApis, getPlaceholderApis } from "@/lib/nasa-catalog";

export const metadata: Metadata = {
  title: "Catalog | NASA Signal Desk",
  description: "Full NASA API catalog coverage for the signal desk app.",
};

export default function CatalogPage() {
  const liveViews = getBuiltApis();
  const placeholders = getPlaceholderApis();

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Catalog</p>
        <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
          Every NASA API in the desk, grouped by what is already built and what is queued next.
        </h1>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Live</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Working views
            </h2>
          </div>
          <p className="text-sm text-white/50">{liveViews.length} live</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {liveViews.map((api) => (
            <Link
              key={api.slug}
              className="border border-white/10 px-5 py-5 transition hover:bg-white/[0.035]"
              href={`/${api.slug}`}
            >
              <p className="section-label">{api.source}</p>
              <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                {api.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/60">{api.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Placeholder</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Planned surfaces
            </h2>
          </div>
          <p className="text-sm text-white/50">{placeholders.length} queued</p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {placeholders.map((api) => (
            <Link
              key={api.slug}
              className="border border-white/10 px-5 py-5 transition hover:bg-white/[0.035]"
              href={`/${api.slug}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-label">{api.source}</p>
                  <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                    {api.title}
                  </h3>
                </div>
                <span className="border border-white/12 px-2 py-1 text-xs uppercase tracking-[0.2em] text-white/46">
                  Placeholder
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/60">{api.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
