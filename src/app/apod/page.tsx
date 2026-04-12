/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import ApodLoadMoreLink from "@/components/apod-load-more-link";
import { getApod, getApodRange } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "APOD | NASA Signal Desk",
  description: "Astronomy Picture of the Day with quick date navigation and weekly comparison.",
};

type ApodPageProps = {
  searchParams: Promise<{ count?: string; date?: string }>;
};

const APOD_PAGE_SIZE = 8;
const APOD_MAX_OVERVIEW_ITEMS = 40;

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

function isDirectVideoAsset(url: string) {
  const normalized = url.split("?")[0]?.toLowerCase() ?? "";
  return normalized.endsWith(".mp4") || normalized.endsWith(".mov") || normalized.endsWith(".webm");
}

function resolveOverviewCount(value?: string) {
  const parsed = Number.parseInt(value ?? String(APOD_PAGE_SIZE), 10);

  if (Number.isNaN(parsed)) {
    return APOD_PAGE_SIZE;
  }

  return Math.min(APOD_MAX_OVERVIEW_ITEMS, Math.max(APOD_PAGE_SIZE, parsed));
}

export default async function ApodPage({ searchParams }: ApodPageProps) {
  const { count, date } = await searchParams;
  const overviewCount = resolveOverviewCount(count);
  const [entryResult, overviewResult] = await Promise.allSettled([
    getApod(date),
    getApodRange(undefined, overviewCount),
  ]);

  const overviewEntriesFromFeed = overviewResult.status === "fulfilled" ? overviewResult.value : [];
  const entry = entryResult.status === "fulfilled" ? entryResult.value : overviewEntriesFromFeed[0];

  if (!entry) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">Astronomy Picture Of The Day</p>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
                APOD is temporarily unavailable
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
                NASA&apos;s APOD endpoint did not respond reliably enough for the page to render right now.
                The rest of the desk should still work, and this view should recover on the next successful fetch.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link className="nav-chip" href="/apod">
                Retry APOD
              </Link>
              <Link className="nav-chip" href="/catalog">
                Back to catalog
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const overviewEntries = overviewEntriesFromFeed.length > 0 ? overviewEntriesFromFeed : [entry];
  const overviewEntriesUnavailable = overviewResult.status !== "fulfilled";
  const selectedInOverview = overviewEntries.some((item) => item.date === entry.date);
  const nextOverviewCount = Math.min(APOD_MAX_OVERVIEW_ITEMS, overviewCount + APOD_PAGE_SIZE);

  const today = new Date().toISOString().slice(0, 10);
  const canGoForward = entry.date < today;
  const showNativeVideoPlayer = entry.media_type === "video" && isDirectVideoAsset(entry.url);

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
          ) : showNativeVideoPlayer ? (
            <video
              className="aspect-[16/10] w-full bg-black object-contain"
              controls
              playsInline
              preload="metadata"
              src={entry.url}
            >
              <a href={entry.url} rel="noreferrer" target="_blank">
                Open video
              </a>
            </video>
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
            <Link className="nav-chip" href={`/apod?date=${shiftDate(entry.date, -1)}&count=${overviewCount}`}>
              Previous day
            </Link>
            <Link className="nav-chip" href={`/apod?count=${overviewCount}`}>
              Today
            </Link>
            {canGoForward ? (
              <Link className="nav-chip" href={`/apod?date=${shiftDate(entry.date, 1)}&count=${overviewCount}`}>
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
            <p className="section-label">APOD Overview</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Latest picks, kept stable while you inspect any one item
            </h2>
          </div>
          {overviewEntriesUnavailable ? (
            <p className="max-w-md text-right text-sm leading-6 text-white/56">
              NASA&apos;s recent APOD feed is temporarily unavailable, so this section is showing the
              selected entry only.
            </p>
          ) : (
            <p className="max-w-md text-right text-sm leading-6 text-white/56">
              Load more extends the same latest-first overview instead of rebuilding the strip around the selected day.
            </p>
          )}
        </div>
        {!selectedInOverview ? (
          <p className="mt-4 text-sm leading-6 text-white/56">
            The selected day is older than the current overview window. Load more to bring it back into the gallery.
          </p>
        ) : null}
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewEntries.map((item) => {
            const preview = item.media_type === "image" ? item.url : item.thumbnail_url;

            return (
              <Link
                key={item.date}
                className={`overflow-hidden border border-white/10 transition hover:border-white/18 hover:bg-white/[0.03] ${
                  item.date === entry.date ? "bg-white/[0.04]" : "bg-transparent"
                }`}
                href={`/apod?date=${item.date}&count=${overviewCount}`}
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
        {!overviewEntriesUnavailable && overviewCount < APOD_MAX_OVERVIEW_ITEMS ? (
          <div className="mt-5 flex justify-center">
            <ApodLoadMoreLink
              href={
                entry.date === today
                  ? `/apod?count=${nextOverviewCount}`
                  : `/apod?date=${entry.date}&count=${nextOverviewCount}`
              }
              label={`Load ${Math.min(APOD_PAGE_SIZE, APOD_MAX_OVERVIEW_ITEMS - overviewCount)} more`}
            />
          </div>
        ) : null}
      </section>
    </main>
  );
}
