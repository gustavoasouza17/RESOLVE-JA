import { useMemo } from 'react';

type StarRatingProps = {
  value: number;
  max?: number;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  className?: string;
};

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const StarRating = ({
  value,
  max = 5,
  readOnly = false,
  onChange,
  size = 'md',
  ariaLabel,
  className = '',
}: StarRatingProps) => {
  const stars = useMemo(() => Array.from({ length: max }, (_, index) => index + 1), [max]);
  const sizeClasses = sizeMap[size] ?? sizeMap.md;

  const renderStar = (starValue: number) => {
    const isFilled = starValue <= value;
    const fillClass = isFilled ? 'text-[var(--color-star)]' : 'text-slate-300';

    return (
      <button
        key={starValue}
        type="button"
        onClick={() => {
          if (readOnly || !onChange) return;
          onChange(starValue);
        }}
        disabled={readOnly}
        aria-label={ariaLabel ?? `Avaliar ${starValue} estrela${starValue > 1 ? 's' : ''}`}
        className={`transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${fillClass} ${sizeClasses}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="block">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 0 0 .95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 0 0-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 0 0-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.966a1 1 0 0 0-.364-1.118L2.049 9.393c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 0 0 .95-.69l1.286-3.966z" />
        </svg>
      </button>
    );
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`} role="img" aria-label={ariaLabel ?? `Avaliação: ${value} de ${max} estrelas`}>
      {stars.map(renderStar)}
    </div>
  );
};

export default StarRating;
