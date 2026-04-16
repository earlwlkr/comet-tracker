import type { Metadata } from "next";
import Link from "next/link";
import {
  getTechTransferSnapshot,
  type TechTransferCategory,
} from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "TechTransfer | NASA Signal Desk",
  description: "NASA patent, software, and spinoff search surfaces from the TechTransfer API.",
};

type TechTransferPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

const categories: TechTransferCategory[] = ["patent", "software", "spinoff"];

const defaultQueries: Record<TechTransferCategory, string> = {
  patent: "rocket",
  software: "visualization",
  spinoff: "polymers",
};

function resolveCategory(value?: string) {
  return categories.includes(value as TechTransferCategory)
    ? (value as TechTransferCategory)
    : "patent";
}

function buildLink(category: TechTransferCategory, query: string) {
  return `/techtransfer?category=${category}&q=${encodeURIComponent(query)}`;
}

export default async function TechTransferPage({ searchParams }: TechTransferPageProps) {
  const params = await searchParams;
  const category = resolveCategory(params.category);
  const query = params.q?.trim() || defaultQueries[category];
  let snapshot: Awaited<ReturnType<typeof getTechTransferSnapshot>> | null = null;

  try {
    snapshot = await getTechTransferSnapshot(category, query);
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">TechTransfer</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            TechTransfer search is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The current patent, software, or spinoff query did not return during this render.
          </p>
        </section>
      </main>
    );
  }

  const activeResult = snapshot.results[0];
  const centerCount = new Set(snapshot.results.map((item) => item.center).filter(Boolean)).size;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">NASA Technology Transfer</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              NASA technology search results, turned into readable cards instead of positional arrays.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              TechTransfer returns patents, software, and spinoffs with different result mixes, so
              this route normalizes the records and keeps the category switch simple.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Category</p>
              <p className="mt-3 text-base capitalize text-white">{snapshot.category}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Query</p>
              <p className="mt-3 text-base text-white">{snapshot.query}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Results</p>
              <p className="metric-value mt-3 text-white">{snapshot.total}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Centers shown</p>
              <p className="metric-value mt-3 text-white">{centerCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <Link
              key={item}
              className={`nav-chip capitalize ${snapshot.category === item ? "bg-white/[0.08] text-white" : ""}`}
              href={buildLink(item, defaultQueries[item])}
            >
              {item}
            </Link>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[defaultQueries[snapshot.category], "energy", "robotics", "imaging"].map((item) => (
            <Link key={item} className="nav-chip" href={buildLink(snapshot.category, item)}>
              {item}
            </Link>
          ))}
        </div>
      </section>

      {activeResult ? (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="surface px-6 py-6 sm:px-8">
            <p className="section-label">Top result</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
              {activeResult.title}
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="section-label">Case number</p>
                <p className="mt-2 text-white">{activeResult.caseNumber ?? "Unlisted"}</p>
              </div>
              <div>
                <p className="section-label">Center</p>
                <p className="mt-2 text-white">{activeResult.center ?? "Unlisted"}</p>
              </div>
              <div>
                <p className="section-label">Status</p>
                <p className="mt-2 text-white">{activeResult.status ?? "Unlisted"}</p>
              </div>
              <div>
                <p className="section-label">API handoff</p>
                <a className="data-link mt-2 inline-block" href={snapshot.endpoint} rel="noreferrer" target="_blank">
                  Open current API query
                </a>
              </div>
            </div>
          </aside>

          <div className="surface px-6 py-6 sm:px-8">
            <p className="section-label">Description</p>
            <p className="mt-4 text-sm leading-6 text-white/60">{activeResult.description}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/10 p-4">
                <p className="section-label">Tags</p>
                <p className="mt-3 text-sm text-white/72">{activeResult.tags ?? "No tags listed"}</p>
              </div>
              <div className="border border-white/10 p-4">
                <p className="section-label">Search score</p>
                <p className="mt-3 text-sm text-white/72">
                  {typeof activeResult.score === "number"
                    ? activeResult.score.toFixed(2)
                    : "Unlisted"}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="surface overflow-hidden">
        <div className="grid grid-cols-[minmax(0,1fr)_130px_110px] gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.24em] text-white/42 sm:px-8">
          <p>Technology</p>
          <p>Center</p>
          <p>Status</p>
        </div>
        {snapshot.results.slice(0, 12).map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_130px_110px] gap-4 border-b border-white/8 px-6 py-5 text-sm sm:px-8"
          >
            <div>
              <p className="text-base font-medium text-white">{item.title}</p>
              <p className="mt-1 text-white/54">{item.caseNumber ?? "No case number"}</p>
              <p className="mt-2 line-clamp-2 text-white/42">{item.description}</p>
            </div>
            <p className="text-white/62">{item.center ?? "n/a"}</p>
            <p className="text-white/62">{item.status ?? "n/a"}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
