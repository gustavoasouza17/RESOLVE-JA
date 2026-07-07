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
    'inline-flex items-center justify-center rounded-[12px] px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

  const variantStyles =
    variant === 'secondary'
      ? 'bg-[var(--color-navy)] text-white hover:bg-[var(--color-tertiary)] focus:ring-[var(--color-primary)]'
      : 'bg-[var(--color-secondary)] text-[var(--color-navy)] shadow-[0_12px_32px_rgba(255,217,0,0.18)] hover:brightness-95 focus:ring-[var(--color-secondary)]';

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
