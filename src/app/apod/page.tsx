/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getApod, getApodRange } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "APOD | NASA Signal Desk",
  description: "Astronomy Picture of the Day with quick date navigation and weekly comparison.",
};

type ApodPageProps = {
  searchParams: Promise<{ date?: string }>;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    weekday: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function shiftDate(value: string, amount: number) {
  const next = new Date(`${value}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}

export default async function ApodPage({ searchParams }: ApodPageProps) {
  const { date } = await searchParams;
  const entry = await getApod(date);
  let recentEntries = [entry];
  let recentEntriesUnavailable = false;

  try {
    recentEntries = await getApodRange(entry.date, 7);
  } catch {
    recentEntriesUnavailable = true;
  }

  const today = new Date().toISOString().slice(0, 10);
  const canGoForward = entry.date < today;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Astronomy Picture Of The Day</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              {entry.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              NASA&apos;s daily astronomy feature, shown with the context you usually have to click
              around to gather: date position, media type, source asset, and the last week of
              selections.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/62">
            <div>
              <p className="section-label">Date</p>
              <p className="mt-2 text-white">{formatDateLabel(entry.date)}</p>
            </div>
            <div>
              <p className="section-label">Media</p>
              <p className="mt-2 text-white">{entry.media_type}</p>
            </div>
            <div>
              <p className="section-label">Rights</p>
              <p className="mt-2 text-white">{entry.copyright ?? "Public domain or unspecified"}</p>
            </div>
            <div>
              <p className="section-label">Source</p>
              <a className="data-link mt-2 inline-block" href={entry.hdurl ?? entry.url} target="_blank" rel="noreferrer">
                Open original
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="surface overflow-hidden">
          {entry.media_type === "image" ? (
            <img
              alt={entry.title}
              className="aspect-[16/10] w-full object-cover"
              src={entry.url}
            />
          ) : (
            <iframe
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-[16/10] w-full border-0"
              src={entry.url}
              title={entry.title}
            />
          )}
        </div>

        <aside className="surface flex flex-col justify-between px-6 py-6">
          <div>
            <p className="section-label">Explanation</p>
            <p className="mt-4 text-sm leading-7 text-white/70">{entry.explanation}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            <Link className="nav-chip" href={`/apod?date=${shiftDate(entry.date, -1)}`}>
              Previous day
            </Link>
            <Link className="nav-chip" href="/apod">
              Today
            </Link>
            {canGoForward ? (
              <Link className="nav-chip" href={`/apod?date=${shiftDate(entry.date, 1)}`}>
                Next day
              </Link>
            ) : (
              <span className="nav-chip cursor-default text-white/34">Next day</span>
            )}
          </div>
        </aside>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Last Seven APOD Picks</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Quick visual comparison
            </h2>
          </div>
          {recentEntriesUnavailable ? (
            <p className="max-w-md text-right text-sm leading-6 text-white/56">
              NASA&apos;s weekly APOD feed is temporarily unavailable, so this section is showing the
              current entry only.
            </p>
          ) : (
            <p className="max-w-md text-right text-sm leading-6 text-white/56">
              Useful for spotting when NASA shifts from spacecraft coverage to sky photography,
              planetary imaging, or explanatory diagrams.
            </p>
          )}
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {recentEntries.map((item) => {
            const preview = item.media_type === "image" ? item.url : item.thumbnail_url;

            return (
              <Link
                key={item.date}
                className={`overflow-hidden border border-white/10 transition hover:border-white/18 hover:bg-white/[0.03] ${
                  item.date === entry.date ? "bg-white/[0.04]" : "bg-transparent"
                }`}
                href={`/apod?date=${item.date}`}
              >
                <div className="aspect-[16/10] bg-black/30">
                  {preview ? (
                    <img alt={item.title} className="h-full w-full object-cover" src={preview} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/40">
                      No preview
                    </div>
                  )}
                </div>
                <div className="px-4 py-4">
                  <p className="section-label">{formatDateLabel(item.date)}</p>
                  <h3 className="mt-2 text-base font-medium text-white">{item.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
