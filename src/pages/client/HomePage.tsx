import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/organisms/Navbar';
import MapView from '../../components/organisms/MapView';
import CategoryCard from '../../components/molecules/CategoryCard';
import ProfessionalCard from '../../components/molecules/ProfessionalCard';
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

const activeCategories = categories.filter((category) => category.ativa).slice(0, 6);

const generateCoord = (
  baseLat: number,
  baseLng: number,
  distanceKm: number,
  seed: number
) => {
  const angle = (seed * 137.5) % 360;
  const rad = (angle * Math.PI) / 180;
  const latOffset = (distanceKm / 111) * Math.cos(rad);
  const lngOffset = (distanceKm / 102) * Math.sin(rad);
  return { lat: baseLat + latOffset, lng: baseLng + lngOffset };
};

const getUserName = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return 'Usuário';
    const parsed = JSON.parse(raw);
    return parsed.fullName || 'Usuário';
  } catch {
    return 'Usuário';
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [locationError, setLocationError] = useState('');
  const userName = getUserName();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const categoryCards = useMemo(
    () =>
      activeCategories.map((category) => ({
        title: category.nome,
        description: 'Profissionais verificados e avaliados',
        icon: iconMap[category.icone] ?? '🔧',
        to: `/buscar/${encodeURIComponent(category.nome.toLowerCase())}`,
      })),
    []
  );

  const featuredProfessionals = mockProfessionals
    .slice()
    .sort((a, b) => a.distanciaKm - b.distanciaKm)
    .slice(0, 4);

  const mapProfessionals = featuredProfessionals.map((professional, index) => {
    const coords = generateCoord(-23.5505, -46.6333, professional.distanciaKm, index + 1);
    return {
      uid: professional.uid,
      nome: professional.nome,
      categoria: professional.categorias[0],
      lat: coords.lat,
      lng: coords.lng,
      distance: professional.distanciaKm,
    };
  });

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (query) {
      navigate(`/buscar/${encodeURIComponent(query)}`);
    }
  };

  const handleSelectProfessional = (uid: string) => {
    navigate(`/profissional/${uid}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <Navbar variant="client" userName={userName} profileLink="/perfil" />

      <main className="mx-auto max-w-6xl responsive-page-padding pt-6 lg:px-8">
        <section className="rounded-[32px] bg-[var(--color-navy)] p-6 text-white shadow-[0_24px_80px_rgba(26,43,76,0.18)]">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-primary)]/90">Bem-vindo de volta</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Olá, {userName}!</h1>
              <p className="mt-4 max-w-xl text-base text-white/85">O que você quer fazer hoje? Busque profissionais, veja quem está disponível perto de você ou peça um orçamento rápido.</p>
            </div>
            <div className="hidden rounded-[32px] bg-white/10 p-4 text-center sm:block">
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-primary)]">Top</p>
              <p className="mt-2 text-3xl font-bold">4.9★</p>
              <p className="text-sm text-white/80">Média do app</p>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar profissionais ou categoria"
              className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">🔍</span>
          </form>
        </section>

        <section className="mt-6 rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold text-[var(--color-navy)]">Categorias</p>
              <p className="text-sm text-slate-500">Escolha a especialidade desejada</p>
            </div>
            <div className="inline-flex overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'list'
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Ver Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-[var(--color-navy)] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Ver Mapa
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCards.map((category) => (
              <CategoryCard
                key={category.title}
                icon={category.icon}
                label={category.title}
                description={category.description}
                to={category.to}
              />
            ))}
          </div>

          {isOffline ? (
            <div className="mt-5 rounded-[32px] bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
              Resultados offline. Alguns dados podem estar desatualizados.
            </div>
          ) : null}

          <div className="mt-6 rounded-[32px] bg-[var(--color-bg-light)] p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-base font-semibold text-[var(--color-navy)]">Profissionais próximos</p>
                <p className="text-sm text-slate-500">Veja os profissionais mais próximos do seu bairro.</p>
              </div>
            </div>

            {viewMode === 'map' ? (
              <MapView
                professionals={mapProfessionals}
                onSelectProfessional={handleSelectProfessional}
                onLocationError={setLocationError}
                className="mt-5"
              />
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {featuredProfessionals.length > 0 ? (
                  featuredProfessionals.map((professional) => (
                    <ProfessionalCard
                      key={professional.uid}
                      id={professional.uid}
                      name={professional.nome}
                      category={professional.categorias[0]}
                      rating={professional.avaliacaoMedia}
                      reviews={professional.totalAvaliacoes}
                      services={professional.totalServicos}
                      distance={`${professional.distanciaKm.toFixed(1)} km`}
                      image={professional.fotoUrl}
                      badgeLabel="Mais perto"
                    />
                  ))
                ) : (
                  <div className="rounded-[24px] bg-[var(--color-bg-light)] p-6 text-center text-slate-600">
                    Nenhum profissional encontrado nesta área ainda.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

          <aside className="space-y-4">
            {locationError ? (
              <div className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Localização</p>
                <p className="mt-3 text-sm text-slate-600">{locationError} Informe o bairro ou CEP abaixo.</p>
                <input
                  type="text"
                  placeholder="Digite seu bairro ou CEP"
                  className="mt-4 w-full rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-3 text-sm text-slate-800 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>
            ) : null}

            <div className="rounded-[32px] bg-[var(--color-navy)] p-5 text-white shadow-[0_24px_80px_rgba(26,43,76,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Destaque</p>
              <h2 className="mt-3 text-2xl font-bold">Precisa de ajuda rápida?</h2>
              <p className="mt-2 text-sm text-white/80">Peça um orçamento com descrição e receba retorno de quem já está disponível.</p>
              <Link
                to="/proposta/prof001"
                className="mt-4 inline-flex w-full items-center justify-center rounded-[24px] bg-[var(--color-primary)] px-4 py-4 text-sm font-semibold text-[var(--color-navy)] shadow-sm"
              >
                Solicitar orçado imediato
              </Link>
            </div>
          </aside>
      </main>
    </div>
  );
};

export default HomePage;
