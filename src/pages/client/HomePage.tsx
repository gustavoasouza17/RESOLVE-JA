import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CategoryCard from '../../components/molecules/CategoryCard';
import MapView from '../../components/organisms/MapView';
import categories from '../../constants/categories';
import mockProfessionals from '../../constants/mockProfessionals';

// São Paulo approximate center (fallback)
const SP_CENTER = { lat: -23.5505, lng: -46.6333 };

/**
 * Generate approximate coordinates around São Paulo based on distanceKm.
 * Each professional gets a random-ish offset proportional to their distance.
 */
function generateCoord(
  baseLat: number,
  baseLng: number,
  distanceKm: number,
  seed: number
): { lat: number; lng: number } {
  // 1 degree ≈ 111km at equator, ~111*cos(lat) ≈ 102km for longitude at SP latitude
  const angle = (seed * 137.5) % 360; // golden angle for even-ish distribution
  const rad = (angle * Math.PI) / 180;
  const latOffset = (distanceKm / 111) * Math.cos(rad);
  const lngOffset = (distanceKm / 102) * Math.sin(rad);
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
}

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
    to: `/buscar/${encodeURIComponent(c.nome.toLowerCase())}`,
  }));

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { userName?: string; profile?: string } | null;
  const userName = state?.userName;
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const nearby = mockProfessionals.slice(0, 6);

  const mapProfessionals = mockProfessionals.slice(0, 8).map((p, i) => {
    const coord = generateCoord(SP_CENTER.lat, SP_CENTER.lng, p.distanciaKm, i + 1);
    return {
      uid: p.uid,
      nome: p.nome,
      categoria: p.categorias[0],
      lat: coord.lat,
      lng: coord.lng,
      distance: p.distanciaKm,
    };
  });

  const handleSelectProfessional = (uid: string) => {
    navigate(`/profissional/${uid}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Home</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Olá, {userName ? userName : 'Cliente'}!
            </h1>
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
            <div className="flex flex-col gap-3">
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
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((professional) => (
                  <Link
                    key={professional.uid}
                    to={`/profissional/${professional.uid}`}
                    className="block rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200 transition hover:ring-[var(--color-primary)]/30"
                  >
                    {/* Vertical card: image on top, info below */}
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-t-[28px] bg-slate-200">
                      <img
                        src={professional.fotoUrl}
                        alt={professional.nome}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="space-y-2 p-5">
                      <p className="text-lg font-bold text-[var(--color-navy)]">{professional.nome}</p>
                      <p className="text-sm text-slate-500">
                        {professional.categorias[0]} · {professional.distanciaKm.toFixed(1)} km
                      </p>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="text-[var(--color-star)]">★</span>
                        <span>{professional.avaliacaoMedia.toFixed(1)}</span>
                        <span className="text-slate-400">·</span>
                        <span>{professional.totalServicos} serviços</span>
                      </div>
                      <div className="pt-1">
                        <span className="inline-block rounded-2xl bg-[var(--color-primary)]/15 px-4 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-primary)]/30">
                          Ver perfil →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <MapView
                professionals={mapProfessionals}
                onSelectProfessional={handleSelectProfessional}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
