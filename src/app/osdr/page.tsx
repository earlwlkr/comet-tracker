import type { Metadata } from "next";
import { getOsdrSnapshot } from "@/lib/nasa-extended";

export const metadata: Metadata = {
  title: "OSDR | NASA Signal Desk",
  description: "Open Science Data Repository dataset overview with mission and assay context.",
};

export default async function OsdrPage() {
  let snapshot: Awaited<ReturnType<typeof getOsdrSnapshot>> | null = null;

  try {
    snapshot = await getOsdrSnapshot();
  } catch {
    snapshot = null;
  }

  if (!snapshot) {
    return (
      <main className="space-y-6">
        <section className="surface px-6 py-7 sm:px-8">
          <p className="section-label">Open Science Data Repository</p>
          <h1 className="mt-4 text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
            OSDR dataset metadata is temporarily unavailable
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
            The current dataset snapshot did not return in time. This route will recover
            automatically on the next successful cached fetch.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Open Science Data Repository</p>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h1 className="text-4xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              A research-dataset readout for OSDR, built around one real accession instead of a dead placeholder.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              OSDR is better when treated like a mission-and-assay handoff. This page keeps the
              focus on accession `OSD-48`, its ISS context, and the measurement types behind the
              dataset rather than flattening it into generic catalog copy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-white/10 p-4">
              <p className="section-label">Accession</p>
              <p className="mt-3 text-base text-white">{snapshot.accession}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Assays</p>
              <p className="metric-value mt-3 text-white">{snapshot.assayCount}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Organism</p>
              <p className="mt-3 text-base text-white">{snapshot.organism ?? "Unlisted"}</p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Platform</p>
              <p className="mt-3 text-base text-white">{snapshot.platform ?? "Unlisted"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Dataset spotlight</p>
          <h2 className="mt-2 text-2xl font-medium tracking-[-0.06em] text-white">
            {snapshot.projectTitle}
          </h2>
          <p className="mt-4 text-sm leading-6 text-white/60">
            {snapshot.studyTitle ?? "Study title unavailable from the current metadata response."}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="border border-white/10 p-4">
              <p className="section-label">Mission</p>
              <p className="mt-3 text-base text-white">{snapshot.missionName ?? "Unlisted"}</p>
              <p className="mt-2 text-sm text-white/52">
                {snapshot.missionStart ?? "Unknown start"} to {snapshot.missionEnd ?? "Unknown end"}
              </p>
            </div>
            <div className="border border-white/10 p-4">
              <p className="section-label">Data handoff</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a className="nav-chip" href={snapshot.datasetUrl} rel="noreferrer" target="_blank">
                  Open dataset JSON
                </a>
                {snapshot.filesUrl ? (
                  <a className="nav-chip" href={snapshot.filesUrl} rel="noreferrer" target="_blank">
                    Open file API
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <aside className="surface px-6 py-6 sm:px-8">
          <p className="section-label">Assay profile</p>
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Technology types</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.assayTechnologyTypes.map((item) => (
                  <span key={item} className="border border-white/10 px-3 py-2 text-sm text-white/72">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Measurement types</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.assayMeasurementTypes.map((item) => (
                  <span key={item} className="border border-white/10 px-3 py-2 text-sm text-white/72">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {snapshot.thumbnailUrl ? (
              <a
                className="data-link inline-flex"
                href={snapshot.thumbnailUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open study thumbnail
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
