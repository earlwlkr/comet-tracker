import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApiBySlug, getPlaceholderApis } from "@/lib/nasa-catalog";

type PlaceholderPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPlaceholderApis().map((api) => ({ slug: api.slug }));
}

export async function generateMetadata({ params }: PlaceholderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const api = getApiBySlug(slug);

  if (!api || api.status !== "placeholder") {
    return {};
  }

  return {
    title: `${api.title} | NASA Signal Desk`,
    description: api.summary,
  };
}

export default async function PlaceholderPage({ params }: PlaceholderPageProps) {
  const { slug } = await params;
  const api = getApiBySlug(slug);

  if (!api || api.status !== "placeholder") {
    notFound();
  }

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Placeholder</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              {api.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              {api.summary}
            </p>
          </div>
          <div className="border border-white/10 px-4 py-3 text-sm text-white/56">
            Source: <span className="text-white">{api.source}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface px-6 py-6">
          <p className="section-label">Current state</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            Planned, not yet implemented
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/60">
            This page exists so the full NASA API surface is navigable now, even before every data
            source gets a purpose-built UI.
          </p>
          <Link className="nav-chip mt-5 inline-flex" href="/catalog">
            Back to catalog
          </Link>
        </div>

        <div className="surface px-6 py-6">
          <p className="section-label">What belongs here</p>
          <div className="mt-4 space-y-3">
            {api.plannedFeatures.map((item) => (
              <div key={item} className="border-b border-white/8 pb-3 text-sm leading-6 text-white/62">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
