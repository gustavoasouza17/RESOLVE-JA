import { Link } from 'react-router-dom';
import StarRating from '../../components/atoms/StarRating';

const professionals = [
  {
    id: 'pro-001',
    name: 'Carlos Mendes',
    category: 'Pedreiro',
    distance: '1,2 km',
    rating: 4.9,
    reviews: 127,
    services: 203,
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pro-002',
    name: 'Ana Souza',
    category: 'Encanador',
    distance: '900 m',
    rating: 4.8,
    reviews: 84,
    services: 128,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pro-003',
    name: 'Roberto Lima',
    category: 'Eletricista',
    distance: '2,1 km',
    rating: 4.7,
    reviews: 56,
    services: 143,
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80',
  },
];

const SearchPage = () => {
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
            <p className="mt-2 text-3xl font-semibold text-[var(--color-navy)]">{professionals.length}</p>
          </div>
        </header>

        <div className="space-y-6">
          {professionals.map((professional) => (
            <article key={professional.id} className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="relative h-64 overflow-hidden bg-slate-200">
                <img
                  src={professional.image}
                  alt={`${professional.name} - ${professional.category}`}
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute left-4 top-4 rounded-3xl bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white">
                  ★ {professional.rating.toFixed(1)}
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[var(--color-navy)]">{professional.name}</h2>
                    <p className="text-sm text-slate-500">{professional.category}</p>
                  </div>
                  <Link
                    to={`/profissional/${professional.id}`}
                    className="inline-flex items-center justify-center rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/20"
                  >
                    Ver perfil completo →
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Avaliações</p>
                    <div className="mt-2 flex items-center gap-2">
                      <StarRating value={professional.rating} readOnly size="sm" />
                      <span className="text-sm text-slate-600">({professional.reviews} avaliações)</span>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Serviços</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.services}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-sm text-slate-500">Distância</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.distance}</p>
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
