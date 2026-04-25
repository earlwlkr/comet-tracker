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
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Catalog</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-medium tracking-[-0.08em] text-white sm:text-6xl">
            Every NASA data view in one straightforward index.
          </h1>
        </div>
        <p className="font-mono text-sm text-white/50">{liveViews.length} live routes</p>
      </section>

      <section className="surface px-5 py-5 sm:px-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Live</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Working views
            </h2>
          </div>
          <p className="text-sm text-white/50">{liveViews.length} live</p>
        </div>
        <div className="mt-5">
          {liveViews.map((api) => (
            <Link
              key={api.slug}
              className="simple-row transition hover:bg-white/[0.025] sm:px-2"
              href={`/${api.slug}`}
            >
              <div>
                <p className="text-xl font-medium tracking-[-0.05em] text-white">{api.title}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-white/42">
                  {api.source}
                </p>
              </div>
              <p className="text-sm leading-6 text-white/62">{api.summary}</p>
              <span className="status-pill w-fit">Live</span>
              <span className="font-mono text-sm text-white/46">Open</span>
            </Link>
          ))}
        </div>
      </section>

      {placeholders.length ? (
        <section className="surface px-5 py-5 sm:px-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Placeholder</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                Planned surfaces
              </h2>
            </div>
            <p className="text-sm text-white/50">{placeholders.length} queued</p>
          </div>
          <div className="mt-5">
            {placeholders.map((api) => (
              <Link
                key={api.slug}
                className="simple-row transition hover:bg-white/[0.025] sm:px-2"
                href={`/${api.slug}`}
              >
                <div>
                  <p className="text-xl font-medium tracking-[-0.05em] text-white">{api.title}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-white/42">
                    {api.source}
                  </p>
                </div>
                <p className="text-sm leading-6 text-white/62">{api.summary}</p>
                <span className="w-fit rounded-full border border-white/12 px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-white/46">
                  Queued
                </span>
                <span className="font-mono text-sm text-white/46">Open</span>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Status</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Every catalog entry is now live.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/60">
            The generic placeholder layer has been retired, so the catalog now points only to
            purpose-built route surfaces.
          </p>
        </section>
      )}
    </main>
  );
}
