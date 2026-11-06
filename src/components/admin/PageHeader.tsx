export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

export function NoDatabase() {
  return (
    <div className="card p-6">
      <p className="font-medium">Base de données non configurée</p>
      <p className="mt-1 text-sm text-muted">Définissez DATABASE_URL puis lancez les migrations et le seed (voir README).</p>
    </div>
  );
}
