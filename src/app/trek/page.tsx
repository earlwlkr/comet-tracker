import type { Metadata } from "next";
import { getTrekDestinations } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "Trek | NASA Signal Desk",
  description: "NASA Trek planetary map destinations for Moon, Mars, and Vesta.",
};

export default function TrekPage() {
  const destinations = getTrekDestinations();

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">NASA Trek</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Planetary map portals, framed as real exploration handoffs instead of one more empty tile placeholder.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              Trek is most compelling at the portal level: Moon Trek, Mars Trek, and Vesta Trek all
              expose layered planetary maps, measurement tools, and feature lookup in a browser
              experience that is richer than a raw capabilities URL.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Destinations</p>
              <p className="metric-value mt-3 text-white">{destinations.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Explorer model</p>
              <p className="mt-3 text-base text-white">Portal-first</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Map style</p>
              <p className="mt-3 text-base text-white">Layered planetary GIS</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Best handoff</p>
              <p className="mt-3 text-base text-white">Browser exploration</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {destinations.map((item) => (
          <article key={item.title} className="surface flex flex-col justify-between px-6 py-6 sm:px-8">
            <div>
              <p className="section-label">Trek destination</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
                {item.title}
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/60">{item.description}</p>
              <div className="mt-6">
                <p className="section-label">Focus</p>
                <p className="mt-2 text-sm leading-6 text-white/72">{item.focus}</p>
              </div>
              <div className="mt-6">
                <p className="section-label">Useful layers</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.layers.map((layer) => (
                    <span key={layer} className="border border-white/10 px-3 py-2 text-sm text-white/72">
                      {layer}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <a className="nav-chip" href={item.url} rel="noreferrer" target="_blank">
                Launch {item.title}
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label">Why this route exists</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              Trek belongs in the catalog because the portal family is itself the product.
            </h2>
          </div>
          <p className="text-sm leading-6 text-white/60">
            Instead of pretending there is one neat JSON feed behind Trek, this page points the desk
            toward the actual NASA planetary experiences that users reach for when they want map
            layers, terrain context, and feature lookup on Moon, Mars, or Vesta.
          </p>
        </div>
      </section>
    </main>
  );
}
