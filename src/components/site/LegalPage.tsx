export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-32 pb-12 sm:px-6">
      <p className="kicker">legal $</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-xs text-muted">{updated}</p>
      <div className="mt-10 space-y-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-2xl font-semibold">{s.h}</h2>
            {s.p.map((p, i) => (
              <p key={i} className="mt-3 leading-relaxed text-fg-soft">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
