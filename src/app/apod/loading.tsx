export default function Loading() {
  return (
    <main className="space-y-6">
      <section className="surface px-6 py-7 sm:px-8">
        <p className="section-label">Astronomy Picture Of The Day</p>
        <div className="mt-4 grid gap-4">
          <div className="h-12 max-w-3xl bg-white/8" />
          <div className="h-4 max-w-2xl bg-white/6" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="surface h-[420px] animate-pulse bg-white/[0.03]" />
        <div className="surface h-[420px] animate-pulse bg-white/[0.03]" />
      </section>

      <section className="surface px-6 py-6 sm:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="section-label">Last Seven APOD Picks</p>
            <div className="mt-2 h-8 w-56 bg-white/8" />
          </div>
          <div className="h-4 w-64 bg-white/6" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="overflow-hidden border border-white/10">
              <div className="aspect-[16/10] animate-pulse bg-white/[0.03]" />
              <div className="space-y-3 px-4 py-4">
                <div className="h-3 w-24 bg-white/8" />
                <div className="h-4 w-full bg-white/6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
