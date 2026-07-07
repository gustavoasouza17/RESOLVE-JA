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
      className={`overflow-hidden rounded-[24px] bg-gradient-to-r from-[var(--color-navy)] via-[var(--color-tertiary)] to-[var(--color-primary)] p-6 text-white shadow-[0_24px_80px_rgba(26,43,76,0.16)] ${className}`}
      aria-label="Banner de estatísticas"
    >
      <div className="mb-5 max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-secondary)]/90">Destaque</p>
        <h2 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{title}</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0 rounded-[16px] bg-white/10 p-4 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/80 break-normal">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold leading-none text-white break-normal">{metric.value}</p>
            {metric.hint ? <p className="mt-2 text-sm text-slate-100/80 break-normal">{metric.hint}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsBanner;
