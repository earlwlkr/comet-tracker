/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { searchNasaImages } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "Images | NASA Signal Desk",
  description: "NASA Image and Video Library search with useful result previews.",
};

type ImagesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

const suggestedQueries = ["moon", "mars", "webb", "iss", "saturn", "earth"];

function formatImageDate(value: string | null) {
  if (!value) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ImagesPage({ searchParams }: ImagesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || "moon";
  const results = await searchNasaImages(query);
  const datedItems = results.items.filter((item) => item.dateCreated);
  const newestItem = [...datedItems].sort((left, right) =>
    (right.dateCreated ?? "").localeCompare(left.dateCreated ?? ""),
  )[0];

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">NASA Image and Video Library</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Search NASA imagery by subject, then scan the strongest matches fast.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              This is a working search surface rather than a poster wall: query, preview, date, NASA
              ID, and direct asset links stay visible.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Query</p>
              <p className="metric-value mt-3 text-white">{query}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Total hits</p>
              <p className="metric-value mt-3 text-white">{results.totalHits}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Shown</p>
              <p className="metric-value mt-3 text-white">{results.items.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Newest on page</p>
              <p className="mt-3 text-base text-white">{formatImageDate(newestItem?.dateCreated ?? null)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-3">
          {suggestedQueries.map((item) => (
            <Link
              key={item}
              className={`nav-chip ${item === query ? "bg-white/[0.08] text-white" : ""}`}
              href={`/images?q=${encodeURIComponent(item)}`}
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {results.items.map((item) => (
          <article key={`${item.nasaId ?? item.title}`} className="surface overflow-hidden">
            <div className="aspect-[16/10] bg-black/30">
              {item.previewUrl ? (
                <img alt={item.title} className="h-full w-full object-cover" src={item.previewUrl} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  No preview
                </div>
              )}
            </div>
            <div className="px-5 py-5">
              <p className="section-label">{item.nasaId ?? "NASA asset"}</p>
              <h2 className="mt-2 text-xl font-medium tracking-[-0.04em] text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-white/52">{formatImageDate(item.dateCreated)}</p>
              {item.description ? (
                <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/62">{item.description}</p>
              ) : null}
              {item.nasaId ? (
                <a
                  className="data-link mt-4 inline-block text-sm"
                  href={`https://images.nasa.gov/details-${item.nasaId}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open asset
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
