import type { ChangeEventHandler, InputHTMLAttributes } from 'react';

export type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  name?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'placeholder'>;

const Input = ({
  label,
  error,
  helperText,
  id,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
  className = '',
  ...rest
}: InputProps) => {
  const inputId = id || name;

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-900">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200'
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helptext` : undefined}
        {...rest}
      />

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-rose-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helptext`} className="text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
