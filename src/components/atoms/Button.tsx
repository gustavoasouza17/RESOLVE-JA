import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = {
  variant?: ButtonVariant;
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...rest
}: ButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-[24px] px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variantStyles =
    variant === 'secondary'
      ? 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200'
      : 'bg-[var(--color-primary)] text-[var(--color-navy)] hover:bg-[#fce967] focus:ring-[var(--color-primary)]';

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
