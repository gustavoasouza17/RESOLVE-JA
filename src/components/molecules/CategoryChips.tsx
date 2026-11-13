import type { FC } from 'react';

type Props = {
  categories: string[] | string | null | undefined;
  highlight?: string;
  limit?: number;
};

const CategoryChips: FC<Props> = ({ categories, highlight, limit = 3 }) => {
  const list = Array.isArray(categories)
    ? categories
    : categories
    ? [categories]
    : [];
  const normalized = list.filter(Boolean);
  const shown = normalized.slice(0, limit);
  const extra = normalized.length - shown.length;

  if (normalized.length === 0) {
    return <span className="text-xs text-slate-500">Profissional</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((c) => (
        <span
          key={c}
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            highlight && c.toLowerCase() === highlight.toLowerCase()
              ? 'bg-[var(--color-secondary)] text-[var(--color-navy)]'
              : 'bg-slate-100 text-slate-700'
          }`}
        >
          {c}
        </span>
      ))}
      {extra > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">+{extra}</span>}
    </div>
  );
};

export default CategoryChips;