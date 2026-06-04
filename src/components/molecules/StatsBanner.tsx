type StatsBannerProps = {
  title?: string;
  metrics: Array<{
    label: string;
    value: string;
    hint?: string;
  }>;
  className?: string;
};

const StatsBanner = ({
  title = 'Mais segurança em suas pesquisas',
  metrics,
  className = '',
}: StatsBannerProps) => {
  return (
    <section
      className={`overflow-hidden rounded-[32px] bg-gradient-to-r from-violet-600 via-violet-700 to-sky-600 p-6 text-white shadow-lg shadow-violet-500/20 ${className}`}
      aria-label="Banner de estatísticas"
    >
      <div className="mb-5 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-purple-100/80">Destaque</p>
        <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/80">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold leading-none text-white">{metric.value}</p>
            {metric.hint ? <p className="mt-2 text-sm text-slate-100/80">{metric.hint}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBanner;
