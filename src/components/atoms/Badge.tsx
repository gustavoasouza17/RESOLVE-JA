import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'outline';

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  rounded?: boolean;
  className?: string;
} & HTMLAttributes<HTMLSpanElement>;

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-800',
  success: 'bg-emerald-100 text-emerald-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-rose-100 text-rose-800',
  outline: 'border border-slate-200 bg-white text-slate-900',
};

const Badge = ({
  label,
  variant = 'default',
  rounded = true,
  className = '',
  ...rest
}: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${
        variantStyles[variant]
      } ${rounded ? 'rounded-full' : 'rounded-xl'} ${className}`}
      {...rest}
    >
      {label}
    </span>
  );
};

export default Badge;
