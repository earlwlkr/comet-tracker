/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getEpicFrames } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "EPIC | NASA Signal Desk",
  description: "Daily DSCOVR Earth imagery with frame selection and quick orbit context.",
};

type EpicPageProps = {
  searchParams: Promise<{ frame?: string }>;
};

function formatCaptureTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(value.replace(" ", "T") + "Z"));
}

function formatClock(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(value.replace(" ", "T") + "Z"));
}

function formatCoordinate(value: number | null, positive: string, negative: string) {
  if (value === null) {
    return "Unavailable";
  }

  const hemisphere = value >= 0 ? positive : negative;
  return `${Math.abs(value).toFixed(1)}° ${hemisphere}`;
}

function formatDistance(value: number | null) {
  return value === null ? "Unavailable" : `${Math.round(value).toLocaleString("en-US")} km`;
}

export default async function EpicPage({ searchParams }: EpicPageProps) {
  const { frame } = await searchParams;
  const frames = await getEpicFrames(12);
  const activeFrame = frames.find((item) => item.identifier === frame) ?? frames[0];

  if (!activeFrame) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">EPIC</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            Earth Polychromatic Imaging Camera
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            EPIC imagery is temporarily unavailable from NASA right now.
          </p>
        </section>
      </main>
    );
  }

  const longitudeSpan =
    frames.length > 1 && frames[0].centroidLongitude !== null && frames.at(-1)?.centroidLongitude !== null
      ? Math.abs(frames[0].centroidLongitude - (frames.at(-1)?.centroidLongitude ?? 0))
      : null;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Earth Polychromatic Imaging Camera</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Whole-Earth frames from DSCOVR, arranged like a daily observation reel instead of a static archive list.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              EPIC is a strong fit for quick visual comparison because the useful question is usually
              how the visible Earth disk shifts across a single day, not just what the most recent
              frame looks like.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Frames loaded</p>
              <p className="metric-value mt-3 text-white">{frames.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Latest capture</p>
              <p className="mt-3 text-base text-white">{formatClock(activeFrame.captureDate)} UTC</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Centroid</p>
              <p className="mt-3 text-base text-white">
                {formatCoordinate(activeFrame.centroidLatitude, "N", "S")}
              </p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Longitude sweep</p>
              <p className="mt-3 text-base text-white">
                {longitudeSpan === null ? "Unavailable" : `${longitudeSpan.toFixed(1)}° across the reel`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="surface overflow-hidden">
          <img
            alt={`EPIC Earth frame ${activeFrame.identifier}`}
            className="aspect-[1/1] w-full object-cover"
            src={activeFrame.archiveUrl}
          />
        </div>

        <aside className="surface flex flex-col justify-between px-6 py-6">
          <div>
            <p className="section-label">Selected frame</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              {formatCaptureTime(activeFrame.captureDate)}
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/62">{activeFrame.caption}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <p className="section-label">Longitude</p>
                <p className="mt-2 text-white">
                  {formatCoordinate(activeFrame.centroidLongitude, "E", "W")}
                </p>
              </div>
              <div>
                <p className="section-label">DSCOVR distance</p>
                <p className="mt-2 text-white">{formatDistance(activeFrame.dscovrDistanceKm)}</p>
              </div>
              <div>
                <p className="section-label">Moon vector distance</p>
                <p className="mt-2 text-white">{formatDistance(activeFrame.lunarDistanceKm)}</p>
              </div>
              <div>
                <p className="section-label">Source frame</p>
                <a className="data-link mt-2 inline-block" href={activeFrame.archiveUrl} rel="noreferrer" target="_blank">
                  Open NASA archive image
                </a>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Daily reel</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Browse the latest EPIC sweep
            </h2>
          </div>
          <p className="max-w-md text-right text-sm leading-6 text-white/56">
            The strip stays on one day so the visual shift is easy to read without introducing longer-range archive noise.
          </p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {frames.map((item) => (
            <Link
              key={item.identifier}
              className={`overflow-hidden border border-white/10 transition hover:border-white/18 hover:bg-white/[0.03] ${
                item.identifier === activeFrame.identifier ? "bg-white/[0.04]" : "bg-transparent"
              }`}
              href={`/epic?frame=${item.identifier}`}
            >
              <div className="aspect-square bg-black/30">
                <img
                  alt={`EPIC thumbnail ${item.identifier}`}
                  className="h-full w-full object-cover"
                  src={item.archiveUrl}
                />
              </div>
              <div className="px-4 py-4">
                <p className="section-label">{formatClock(item.captureDate)} UTC</p>
                <p className="mt-2 text-sm text-white/64">
                  {formatCoordinate(item.centroidLongitude, "E", "W")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
