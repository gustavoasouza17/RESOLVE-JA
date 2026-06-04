type ProposalCardProps = {
  title: string;
  description: string;
  budget: string;
  clientName?: string;
  date?: string;
  status?: 'pending' | 'accepted' | 'declined' | 'awaiting';
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
};

const statusStyles: Record<NonNullable<ProposalCardProps['status']>, string> = {
  pending: 'bg-amber-100 text-amber-900',
  accepted: 'bg-emerald-100 text-emerald-900',
  declined: 'bg-rose-100 text-rose-900',
  awaiting: 'bg-slate-100 text-slate-700',
};

const ProposalCard = ({
  title,
  description,
  budget,
  clientName,
  date,
  status = 'pending',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  className = '',
}: ProposalCardProps) => {
  return (
    <article className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[var(--color-navy)]">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[status]}`}>
            {status === 'pending' ? 'Pendente' : status === 'accepted' ? 'Aceita' : status === 'declined' ? 'Recusada' : 'Aguardando'}
          </span>
          <span className="text-sm font-semibold text-slate-700">{budget}</span>
          {date ? <span className="text-sm text-slate-500">{date}</span> : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {clientName ? (
          <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-navy)]">{clientName}</p>
          </div>
        ) : null}
        <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Orçamento</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-navy)]">{budget}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[#fce967]"
          >
            {actionLabel}
          </button>
        ) : null}
        {secondaryLabel && onSecondaryAction ? (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default ProposalCard;
