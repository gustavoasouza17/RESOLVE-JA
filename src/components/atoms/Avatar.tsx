import { useState, type ImgHTMLAttributes } from 'react';

export const FALLBACK_AVATAR_IMAGE = '/logo.jpg';

export type AvatarProps = {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
  /** Quando true, exibe a logo do ResolveJá em vez de iniciais quando o src é vazio. */
  useLogoFallback?: boolean;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;

const sizeMap = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-lg',
};

const getInitials = (name: string) => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const Avatar = ({
  src,
  name,
  size = 'md',
  className = '',
  alt,
  useLogoFallback = false,
  ...rest
}: AvatarProps) => {
  const initials = getInitials(name);
  const sizeClasses = sizeMap[size] ?? sizeMap.md;
  const hasValidSrc = typeof src === 'string' && src.trim().length > 0;
  const [logoErrored, setLogoErrored] = useState(false);

  if (hasValidSrc) {
    return (
      <img
        src={src}
        alt={alt ?? `${name} profile photo`}
        className={`rounded-full object-cover ${sizeClasses} ${className}`}
        {...rest}
      />
    );
  }

  if (useLogoFallback && !logoErrored) {
    return (
      <img
        src={FALLBACK_AVATAR_IMAGE}
        alt={alt ?? `${name} profile avatar`}
        className={`rounded-full object-contain bg-white p-2 ${sizeClasses} ${className}`}
        onError={() => setLogoErrored(true)}
        {...rest}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt ?? `${name} profile avatar`}
      className={`grid place-items-center rounded-full bg-slate-100 text-slate-800 ${sizeClasses} ${className}`}
      {...rest}
    >
      <span className="font-semibold">{initials}</span>
    </div>
  );
};

export default Avatar;
