import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline-danger';

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

  let variantStyles = '';
  switch (variant) {
    case 'secondary':
      variantStyles = 'bg-[var(--color-navy)] text-white hover:bg-[var(--color-tertiary)] focus:ring-[var(--color-primary)]';
      break;
    case 'danger':
      variantStyles = 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-[0_4px_14px_rgba(220,38,38,0.25)]';
      break;
    case 'outline-danger':
      variantStyles = 'border border-red-200 bg-red-50/60 text-red-600 hover:bg-red-100/80 hover:border-red-300 focus:ring-red-400';
      break;
    case 'primary':
    default:
      variantStyles = 'bg-[var(--color-secondary)] text-[var(--color-navy)] shadow-[0_12px_32px_rgba(255,217,0,0.18)] hover:brightness-95 focus:ring-[var(--color-secondary)]';
      break;
  }

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
