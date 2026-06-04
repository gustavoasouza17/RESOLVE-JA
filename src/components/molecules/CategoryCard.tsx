import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type CategoryCardProps = {
  icon: ReactNode;
  label: string;
  description?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
};

const CategoryCard = ({
  icon,
  label,
  description,
  to,
  onClick,
  className = '',
}: CategoryCardProps) => {
  const content = (
    <div className="flex items-center gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[var(--color-primary)]/40 hover:ring-1 hover:ring-[var(--color-primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30">
      <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-3xl bg-violet-800 text-white shadow-lg shadow-violet-900/10">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-base font-semibold text-[var(--color-navy)]">{label}</p>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>

      <span className="text-xl font-bold text-[var(--color-primary)]">→</span>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={`${className} block`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} w-full text-left`}>
      {content}
    </button>
  );
};

export default CategoryCard;
