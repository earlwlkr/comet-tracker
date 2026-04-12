"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Upstream issue</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-medium tracking-[-0.08em] text-white sm:text-5xl">
              This page hit a temporary data error
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/62 sm:text-base">
              One of the upstream NASA requests failed while the route was rendering. A retry usually
              fixes transient API timeouts or rate-limit spikes.
            </p>
            {error.digest ? (
              <p className="mt-3 font-mono text-xs text-white/42">digest: {error.digest}</p>
            ) : null}
          </div>
          <button className="nav-chip" onClick={() => unstable_retry()} type="button">
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
