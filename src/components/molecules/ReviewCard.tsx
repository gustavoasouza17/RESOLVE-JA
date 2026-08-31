import Avatar from '../atoms/Avatar';
import StarRating from '../atoms/StarRating';

type ReviewCardProps = {
  author: string;
  avatarUrl?: string;
  role?: string;
  rating: number;
  comment: string;
  date?: string;
  className?: string;
};

const ReviewCard = ({
  author,
  avatarUrl,
  role,
  rating,
  comment,
  date,
  className = '',
}: ReviewCardProps) => {
  return (
    <article className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-4">
        <Avatar src={avatarUrl} name={author} size="md" />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-[var(--color-navy)] truncate">{author}</h3>
            {role ? <span className="text-sm text-slate-500">· {role}</span> : null}
          </div>
          {date ? <p className="text-sm text-slate-500">{date}</p> : null}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <StarRating value={rating} readOnly size="sm" ariaLabel={`Avaliação de ${rating} estrelas`} />
        <span className="text-sm font-semibold text-slate-700">{rating.toFixed(1)}</span>
      </div>

      {comment && <p className="mt-4 text-sm leading-6 text-slate-600">{comment}</p>}
    </article>
  );
};

export default ReviewCard;
