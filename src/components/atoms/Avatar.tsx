import type { ImgHTMLAttributes } from 'react';

export type AvatarProps = {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
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
  ...rest
}: AvatarProps) => {
  const initials = getInitials(name);
  const sizeClasses = sizeMap[size] ?? sizeMap.md;

  return src ? (
    <img
      src={src}
      alt={alt ?? `${name} profile photo`}
      className={`rounded-full object-cover ${sizeClasses} ${className}`}
      {...rest}
    />
  ) : (
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
