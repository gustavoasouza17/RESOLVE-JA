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
    <div className="flex items-center gap-4 rounded-[16px] bg-[var(--color-surface-low)] p-5 shadow-[0_12px_30px_rgba(26,43,76,0.05)] transition hover:bg-[var(--color-surface-high)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/40">
      <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-tertiary)] to-[var(--color-primary)] text-white shadow-[0_14px_36px_rgba(26,43,76,0.16)]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-[var(--color-navy)] break-normal">{label}</p>
        {description ? <p className="mt-1 text-sm text-slate-500 break-normal">{description}</p> : null}
      </div>

      <span className="text-xl font-bold text-[var(--color-secondary)]">→</span>
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
