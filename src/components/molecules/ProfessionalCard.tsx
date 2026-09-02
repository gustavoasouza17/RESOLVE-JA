import { Link } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';
import StarRating from '../atoms/StarRating';

type ProfessionalCardProps = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  services: number;
  distance: string;
  image: string;
  badgeLabel?: string;
  profileUrl?: string;
  className?: string;
};

const ProfessionalCard = ({
  id,
  name,
  category,
  rating,
  reviews,
  services,
  distance,
  image,
  badgeLabel,
  profileUrl,
  className = '',
}: ProfessionalCardProps) => {
  const destination = profileUrl ?? `/profissional/${id}`;

  return (
    <article className={`overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200 ${className}`}>
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-200">
        <img src={image} alt={`${name} - ${category}`} className="h-full w-full object-cover object-center" />

        <div className="absolute left-4 top-4 rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
          ★ {rating.toFixed(1)}
        </div>

        {badgeLabel ? (
          <Badge
            label={badgeLabel}
            variant="success"
            className="absolute right-4 top-4"
          />
        ) : null}

        <div className="absolute left-4 bottom-4">
          <Avatar src={image} name={name} size="lg" useLogoFallback className="border-4 border-white shadow-xl" />
        </div>
      </div>

      <div className="space-y-5 p-6 pt-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-navy)]">{name}</h2>
            <p className="text-sm text-slate-500">{category}</p>
          </div>
          <Link
            to={destination}
            className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
          >
            Ver perfil completo →
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
            <p className="text-sm text-slate-500">Avaliações</p>
            <div className="mt-2 flex items-center gap-2">
              <StarRating value={rating} readOnly size="sm" />
              <span className="text-sm text-slate-600">({reviews})</span>
            </div>
          </div>
          <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
            <p className="text-sm text-slate-500">Serviços</p>
            <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{services}</p>
          </div>
          <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
            <p className="text-sm text-slate-500">Distância</p>
            <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{distance}</p>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProfessionalCard;
