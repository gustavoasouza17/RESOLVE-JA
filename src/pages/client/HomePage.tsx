import { useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../../components/molecules/CategoryCard';
import categories from '../../constants/categories';
import mockProfessionals from '../../constants/mockProfessionals';

const iconMap: Record<string, string> = {
  hammer: '🧱',
  droplet: '🚿',
  bolt: '💡',
  wood: '🪚',
  palette: '🎨',
  leaf: '🌿',
  wrench: '🔧',
  snowflake: '❄️',
};

const activeCategories = categories
  .filter((c) => c.ativa)
  .slice(0, 6)
  .map((c) => ({
    id: c.id,
    label: c.nome,
    icon: iconMap[c.icone] ?? '🔧',
    to: `/buscar/${c.nome.toLowerCase()}`,
  }));

const HomePage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const nearby = mockProfessionals.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Home</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Olá, Cliente!</h1>
            <p className="mt-2 text-sm text-slate-600">O que você quer fazer hoje?</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar profissionais ou categorias…"
              className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 pl-12 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">🔍</span>
          </form>

          <div className="flex gap-3 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                viewMode === 'list'
                  ? 'bg-[var(--color-navy)] text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
            >
              Ver Lista
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                viewMode === 'map'
                  ? 'bg-[var(--color-navy)] text-white'
                  : 'bg-transparent text-slate-700 hover:bg-slate-100'
              }`}
            >
              Ver Mapa
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Categorias</p>
              <Link to="/buscar" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                Ver todas
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {activeCategories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  icon={<span className="text-xl">{cat.icon}</span>}
                  label={cat.label}
                  description="Profissionais verificados e avaliados"
                  to={cat.to}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {viewMode === 'list' ? 'Profissionais próximos' : 'Mapa'}
              </p>
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-4">
                {nearby.map((professional) => (
                  <Link
                    key={professional.uid}
                    to={`/profissional/${professional.uid}`}
                    className="block rounded-[28px] bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:ring-[var(--color-primary)]/30"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={professional.fotoUrl}
                        alt={professional.nome}
                        className="h-16 w-16 flex-shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[var(--color-navy)]">{professional.nome}</p>
                        <p className="text-sm text-slate-500">{professional.categorias[0]} · {professional.distanciaKm.toFixed(1)} km</p>
                        <p className="text-sm text-slate-600">★ {professional.avaliacaoMedia.toFixed(1)} · {professional.totalServicos} serviços</p>
                      </div>
                      <span className="text-[var(--color-primary)]">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200">
                <div className="aspect-[4/3] w-full bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
                <div className="p-5">
                  <p className="text-sm text-slate-600">
                    Mapa interativo — veja os profissionais mais próximos da sua localização.
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    📍 Usar minha localização
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
