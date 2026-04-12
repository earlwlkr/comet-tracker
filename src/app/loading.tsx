export default function Loading() {
  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Loading</p>
        <div className="mt-4 grid gap-4">
          <div className="h-4 w-32 bg-white/8" />
          <div className="h-12 max-w-3xl bg-white/8" />
          <div className="h-4 max-w-2xl bg-white/6" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface h-[360px] animate-pulse bg-white/[0.03]" />
        <div className="surface h-[360px] animate-pulse bg-white/[0.03]" />
      </section>
    </main>
  );
}
