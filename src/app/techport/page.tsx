import type { Metadata } from "next";
import Link from "next/link";
import { getTechportSnapshot } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "TechPort | NASA Signal Desk",
  description: "Recently updated NASA TechPort projects with a selected project spotlight.",
};

type TechportPageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function TechportPage({ searchParams }: TechportPageProps) {
  const { id } = await searchParams;
  let snapshot: Awaited<ReturnType<typeof getTechportSnapshot>> | null = null;

  try {
    snapshot = await getTechportSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot || !snapshot.projects.length) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">TechPort</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            TechPort project data is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The recent project list or detail lookups did not complete during this render.
          </p>
        </section>
      </main>
    );
  }

  const activeProject =
    snapshot.projects.find((project) => String(project.id) === id) ?? snapshot.projects[0];
  const uniqueCenters = new Set(snapshot.projects.map((project) => project.center).filter(Boolean)).size;
  const completedProjects = snapshot.projects.filter((project) => project.status === "Completed").length;

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">TechPort</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              Recent NASA technology projects, sorted into a portfolio view instead of left as endpoint IDs.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              The page starts with recently updated TechPort records, fetches richer project detail
              for a small working set, and lets you switch the spotlight without leaving the route.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Projects loaded</p>
              <p className="metric-value mt-3 text-white">{snapshot.projects.length}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Centers represented</p>
              <p className="metric-value mt-3 text-white">{uniqueCenters}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Completed</p>
              <p className="metric-value mt-3 text-white">{completedProjects}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Updated since</p>
              <p className="mt-3 text-base text-white">{snapshot.updatedSince}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Project shortlist</p>
          <div className="mt-4 space-y-3">
            {snapshot.projects.map((project) => (
              <Link
                key={project.id}
                className={`block border border-white/10 px-4 py-4 transition hover:bg-white/[0.03] ${
                  project.id === activeProject.id ? "bg-white/[0.04]" : ""
                }`}
                href={`/techport?id=${project.id}`}
              >
                <p className="text-base font-medium text-white">{project.title}</p>
                <p className="mt-1 text-sm text-white/54">
                  {project.center ?? "Unknown org"}
                  {project.status ? ` · ${project.status}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </aside>

        <div className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Selected project</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            {activeProject.title}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 p-4">
              <p className="section-label">Status</p>
              <p className="mt-3 text-base text-white">{activeProject.status ?? "Unlisted"}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Lead organization</p>
              <p className="mt-3 text-base text-white">{activeProject.center ?? "Unlisted"}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Program</p>
              <p className="mt-3 text-base text-white">{activeProject.program ?? "Unlisted"}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Date window</p>
              <p className="mt-3 text-base text-white">{activeProject.timeWindow ?? "Unlisted"}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="section-label">Description</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {activeProject.description ?? "No description published in the current detail response."}
              </p>
            </div>
            <div>
              <p className="section-label">Benefits</p>
              <p className="mt-3 text-sm leading-6 text-white/60">
                {activeProject.benefits ?? "No benefits section published in the current detail response."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
