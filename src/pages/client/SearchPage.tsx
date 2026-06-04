import { Link, useParams } from 'react-router-dom';
import StarRating from '../../components/atoms/StarRating';
import mockProfessionals from '../../constants/mockProfessionals';

const SearchPage = () => {
  const { categoria } = useParams();
  const lowerCategory = categoria?.toLowerCase();
  const filteredProfessionals = lowerCategory
    ? mockProfessionals.filter((professional) =>
        professional.categorias.some((cat) => cat.toLowerCase().includes(lowerCategory))
      )
    : mockProfessionals;

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</p>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Profissionais perto de você</h1>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                Explore prestadores qualificados na sua área. Filtre por categoria, distância e avaliação para encontrar o profissional ideal.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-[var(--color-bg-light)] p-5 text-slate-700 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Resultados</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-navy)]">{filteredProfessionals.length}</p>
          </div>
        </header>

        <div className="space-y-6">
          {filteredProfessionals.map((professional) => (
            <article key={professional.uid} className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="relative h-64 overflow-hidden bg-slate-200">
                <img
                  src={professional.fotoUrl}
                  alt={`${professional.nome} - ${professional.categorias[0]}`}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute left-4 top-4 rounded-3xl bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white">
                  ★ {professional.avaliacaoMedia.toFixed(1)}
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)]">{professional.nome}</h2>
                    <p className="text-sm text-slate-500">{professional.categorias[0]}</p>
                  </div>
                  <Link
                    to={`/profissional/${professional.uid}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
                  >
                    Ver perfil completo →
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Avaliações</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating value={professional.avaliacaoMedia} readOnly size="sm" />
                      <span className="text-sm text-slate-600">({professional.totalAvaliacoes} avaliações)</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Serviços</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.totalServicos}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Distância</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.distanciaKm.toFixed(1)} km</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
