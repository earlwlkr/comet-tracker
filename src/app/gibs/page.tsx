/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { getGibsLayerShowcase } from "@/lib/nasa";

export const metadata: Metadata = {
  title: "GIBS | NASA Signal Desk",
  description: "Curated global Earth imagery layers with whole-Earth previews and NASA WMTS context.",
};

type GibsPageProps = {
  searchParams: Promise<{ layer?: string }>;
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Default layer time";
  }

  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(parsed);
}

export default async function GibsPage({ searchParams }: GibsPageProps) {
  const { layer } = await searchParams;
  const layers = await getGibsLayerShowcase();
  const activeLayer = layers.find((item) => item.id === layer) ?? layers[0];

  if (!activeLayer) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">GIBS</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            Global Imagery Browse Services
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            GIBS metadata is temporarily unavailable from NASA right now.
          </p>
        </section>
      </main>
    );
  }

  const currentEnabledCount = layers.filter((item) => item.current).length;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Global Imagery Browse Services</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              A curated global imagery desk for GIBS, narrowed to layers that are useful to scan at whole-Earth scale.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              GIBS is enormous, so this page treats it like a focused layer shortlist instead of a raw capability dump.
              Each preview is a full-world render built from NASA&apos;s live WMS surface and paired with the layer&apos;s
              default time from WMTS metadata when it is available.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Curated layers</p>
              <p className="metric-value mt-3 text-white">{layers.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Current-enabled</p>
              <p className="metric-value mt-3 text-white">{currentEnabledCount}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Active date</p>
              <p className="mt-3 text-base text-white">{formatDateLabel(activeLayer.defaultTime)}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Tile matrix</p>
              <p className="mt-3 text-base text-white">{activeLayer.matrixSet}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="surface overflow-hidden">
          <img
            alt={activeLayer.title}
            className="aspect-[2/1] w-full object-cover"
            src={activeLayer.previewUrl}
          />
        </div>

        <aside className="surface flex flex-col justify-between px-6 py-6">
          <div>
            <p className="section-label">Active layer</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              {activeLayer.title}
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/62">{activeLayer.description}</p>
            <div className="mt-6 space-y-4 text-sm">
              <div>
                <p className="section-label">Focus</p>
                <p className="mt-2 text-white">{activeLayer.focus}</p>
              </div>
              <div>
                <p className="section-label">Cadence</p>
                <p className="mt-2 text-white">{activeLayer.cadence}</p>
              </div>
              <div>
                <p className="section-label">Layer id</p>
                <p className="mt-2 font-mono text-xs text-white/62">{activeLayer.id}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-sm">
            <a className="nav-chip" href={activeLayer.previewUrl} rel="noreferrer" target="_blank">
              Open full preview
            </a>
            {activeLayer.legendUrl ? (
              <a className="nav-chip" href={activeLayer.legendUrl} rel="noreferrer" target="_blank">
                Open legend
              </a>
            ) : null}
          </div>
        </aside>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Layer shortlist</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Switch the global view
            </h2>
          </div>
          <p className="max-w-md text-right text-sm leading-6 text-white/56">
            This keeps the selection small on purpose: whole-Earth true color, aerosols, and other layers that reveal transport patterns quickly.
          </p>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {layers.map((item) => (
            <Link
              key={item.id}
              className={`overflow-hidden border border-white/10 transition hover:border-white/18 hover:bg-white/[0.03] ${
                item.id === activeLayer.id ? "bg-white/[0.04]" : "bg-transparent"
              }`}
              href={`/gibs?layer=${item.id}`}
            >
              <div className="aspect-[2/1] bg-black/30">
                <img alt={item.title} className="h-full w-full object-cover" src={item.previewUrl} />
              </div>
              <div className="px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-label">{formatDateLabel(item.defaultTime)}</p>
                    <h3 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                      {item.title}
                    </h3>
                  </div>
                  <span className="text-sm text-white/46">{item.matrixSet}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <p className="section-label">WMTS handoff</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-2xl font-medium tracking-[-0.06em] text-white">
              Metadata-aware, but still practical
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/60">
              The page reads NASA&apos;s capability document for default dates and layer metadata, but it renders whole-Earth previews through a simple WMS request so the result is fast and legible.
            </p>
          </div>
          <div className="border border-white/10 px-5 py-5">
            <p className="section-label">Tile template</p>
            <p className="mt-3 break-all font-mono text-xs leading-6 text-white/56">
              {activeLayer.tileTemplate ?? "Template unavailable from metadata response."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
