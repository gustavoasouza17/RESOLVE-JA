import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../../components/organisms/BottomNav';
import NotificationBell from '../../components/molecules/NotificationBell';
import MapView from '../../components/organisms/MapView';
import type {
  MapClientLocation,
  MapProfessional,
} from '../../components/organisms/MapView';
import CategoryCard from '../../components/molecules/CategoryCard';
import ProfessionalCard from '../../components/molecules/ProfessionalCard';
import categories from '../../constants/categories';
import { getProfessionals, type ProfessionalCardData } from '../../services/professionals';
import { geocodeAddress, resolveCepLocation } from '../../services/geocoding';
import { useLocation } from '../../hooks/useLocation';
import { haversineKm } from '../../utils/geo';
import type { GeoPoint } from '../../utils/geo';
import { withTimeout } from '../../utils/async';
import { applyCepMask, onlyNumbers } from '../../utils/cep';

/** Timeout de segurança para as etapas de rede (ViaCEP, geocoding, Firestore). */
const LOOKUP_TIMEOUT_MS = 10000;

/** Radii used by the CEP/bairro search, in km (auto-expansion order). */
const SEARCH_RADII_KM = [5, 10, 20];

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

type RankedProfessional = ProfessionalCardData & {
  distance: number | null;
};

type LocatedProfessional = RankedProfessional & {
  latitude: number;
  longitude: number;
};

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [professionals, setProfessionals] = useState<ProfessionalCardData[]>([]);
  const [loadingProfessionals, setLoadingProfessionals] = useState(true);
  const [professionalsError, setProfessionalsError] = useState('');
  // Fallback por CEP/bairro quando o GPS falha ou a precisão é ruim
  const [manualLocation, setManualLocation] = useState<MapClientLocation | null>(null);
  const [manualAddressLabel, setManualAddressLabel] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationLookupError, setLocationLookupError] = useState('');
  const [locationLookupLoading, setLocationLookupLoading] = useState(false);
  // Protege contra respostas obsoletas de buscas anteriores
  const lookupRequestIdRef = useRef(0);
  // Recarrega os profissionais do Firestore ("Tentar novamente")
  const [retryToken, setRetryToken] = useState(0);
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

  // Carrega os profissionais ativos do Firestore ao montar a tela
  useEffect(() => {
    let cancelled = false;

    const loadProfessionals = async () => {
      setLoadingProfessionals(true);
      setProfessionalsError('');
      try {
        const data = await withTimeout(
          getProfessionals(),
          LOOKUP_TIMEOUT_MS
        );
        if (!cancelled) {
          setProfessionals(data);
        }
      } catch (error) {
        console.error('Erro ao carregar profissionais do Firestore:', error);
        if (!cancelled) {
          setProfessionalsError(
            'Não foi possível carregar os profissionais. Verifique sua conexão e tente novamente.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProfessionals(false);
        }
      }
    };

    loadProfessionals();

    return () => {
      cancelled = true;
    };
  }, [retryToken]);

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

  // Posição efetiva: GPS ou fallback manual (CEP/bairro)
  const gpsLocation: MapClientLocation | null =
    location.latitude != null && location.longitude != null
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        }
      : null;

  const effectiveLocation = manualLocation ?? gpsLocation;
  const hasRealLocation = effectiveLocation != null;

  // Distância real (Haversine) entre o cliente e cada prestador,
  // ordenando do mais próximo para o mais distante
  const rankedProfessionals = useMemo<RankedProfessional[]>(() => {
    const withDistance = professionals.map((professional): RankedProfessional => {
      const distance =
        effectiveLocation &&
        professional.latitude != null &&
        professional.longitude != null
          ? haversineKm(effectiveLocation, {
              latitude: professional.latitude,
              longitude: professional.longitude,
            })
          : null;

      return { ...professional, distance };
    });

    return withDistance.sort(
      (a, b) =>
        (a.distance ?? Number.POSITIVE_INFINITY) -
        (b.distance ?? Number.POSITIVE_INFINITY)
    );
  }, [professionals, effectiveLocation]);

  // Busca por raio quando há localização manual (CEP/bairro):
  // amplia automaticamente 5 km → 10 km → 20 km antes de desistir
  let radiusSearch: {
    radius: number;
    results: RankedProfessional[];
  } | null = null;

  if (manualLocation) {
    for (const radius of SEARCH_RADII_KM) {
      const results = rankedProfessionals.filter(
        (professional) =>
          professional.distance != null && professional.distance <= radius
      );

      if (results.length > 0) {
        radiusSearch = { radius, results };
        break;
      }
    }

    if (!radiusSearch) {
      radiusSearch = {
        radius: SEARCH_RADII_KM[SEARCH_RADII_KM.length - 1],
        results: [],
      };
    }
  }

  // Sem busca manual: exibe todos ordenados por distância (comportamento do GPS)
  const displayProfessionals = radiusSearch
    ? radiusSearch.results
    : rankedProfessionals;

  const featuredProfessionals = displayProfessionals.slice(0, 4);

  // Somente prestadores com coordenadas reais vão para o mapa
  const mapProfessionals: MapProfessional[] = useMemo(() => {
    const withCoords = displayProfessionals.filter(
      (professional): professional is LocatedProfessional =>
        professional.latitude != null && professional.longitude != null
    );

    return withCoords.slice(0, 12).map((professional) => ({
      uid: professional.uid,
      nome: professional.nome,
      categoria: professional.categorias[0] ?? 'Profissional',
      nota: professional.avaliacaoMedia,
      distanciaKm: professional.distance,
      latitude: professional.latitude,
      longitude: professional.longitude,
    }));
  }, [displayProfessionals]);

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

  // Fallback de localização por CEP (ViaCEP + Nominatim — mesma função do
  // fluxo de perfil do prestador) ou bairro. Sempre encerra o loading.
  const performLocationLookup = async () => {
    const query = locationInput.trim();
    const numbers = onlyNumbers(query);
    const requestId = ++lookupRequestIdRef.current;

    setLocationLookupError('');
    setLocationLookupLoading(true);

    try {
      let resolved: { point: GeoPoint; label: string } | null = null;

      if (numbers.length === 8) {
        resolved = await withTimeout(
          resolveCepLocation(numbers),
          LOOKUP_TIMEOUT_MS
        );
      } else if (query.length >= 3) {
        const point = await withTimeout(
          geocodeAddress(`${query}, Brasil`),
          LOOKUP_TIMEOUT_MS
        );
        resolved = point ? { point, label: query } : null;
      } else {
        if (requestId === lookupRequestIdRef.current) {
          setLocationLookupError('Informe um CEP válido ou o nome do bairro.');
        }
        return;
      }

      // Ignora respostas de uma busca já substituída por outra mais recente
      if (requestId !== lookupRequestIdRef.current) return;

      if (!resolved) {
        setLocationLookupError(
          numbers.length === 8
            ? 'CEP não encontrado. Verifique e tente novamente.'
            : 'Não foi possível localizar este bairro. Tente novamente.'
        );
        return;
      }

      setManualLocation({
        latitude: resolved.point.latitude,
        longitude: resolved.point.longitude,
        accuracy: null,
      });
      setManualAddressLabel(resolved.label);
    } catch {
      if (requestId === lookupRequestIdRef.current) {
        setLocationLookupError(
          'Não foi possível buscar a localização. Tente novamente.'
        );
      }
    } finally {
      if (requestId === lookupRequestIdRef.current) {
        setLocationLookupLoading(false);
      }
    }
  };

  const handleLocationLookup = (event: React.FormEvent) => {
    event.preventDefault();
    void performLocationLookup();
  };

  const handleRelocate = () => {
    setManualLocation(null);
    setManualAddressLabel('');
    location.relocate();
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <div className="fixed top-4 right-4 z-50">
        <NotificationBell />
      </div>
      <BottomNav variant="client" />

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
                <p className="text-sm text-slate-500">
                  {radiusSearch
                    ? `Buscando num raio de ${radiusSearch.radius} km${manualAddressLabel ? ` de ${manualAddressLabel}` : ''}`
                    : 'Veja os profissionais mais próximos do seu bairro.'}
                </p>
              </div>
            </div>

            {/* Mapa: renderizado assim que há coordenadas —
                DESACOPLADO do carregamento da lista de
                profissionais. Mesmo com a busca do Firestore
                em andamento (ou vazia), o mapa centraliza no
                local pesquisado com o marcador do cliente. */}
            {viewMode === 'map' ? (
              <div className="mt-5">
                <MapView
                  clientLocation={effectiveLocation}
                  professionals={mapProfessionals}
                  onSelectProfessional={handleSelectProfessional}
                  onRelocate={handleRelocate}
                  visible={viewMode === 'map'}
                  // O spinner só enquanto NÃO há posição alguma:
                  // uma vez resolvido o CEP/bairro, o mapa não
                  // fica preso no loading do GPS.
                  loading={location.loading && !effectiveLocation}
                  loadingData={loadingProfessionals}
                  emptyMessage="Nenhum profissional encontrado nesta área ainda."
                  emptyMessageDetail={
                    radiusSearch
                      ? `Nada num raio de ${radiusSearch.radius} km${
                          manualAddressLabel
                            ? ` de ${manualAddressLabel}`
                            : ''
                        }. Tente outro CEP ou bairro.`
                      : 'Tente outro CEP ou bairro.'
                  }
                />
              </div>
            ) : loadingProfessionals ? (
              <div className="mt-5 flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-10 text-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
                <p className="text-sm text-slate-600">Carregando profissionais…</p>
              </div>
            ) : professionalsError ? (
              <div className="mt-5 rounded-[28px] bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
                <p className="font-semibold">Não foi possível carregar os profissionais.</p>
                <p className="mt-2">{professionalsError}</p>
                <button
                  type="button"
                  onClick={() => setRetryToken((previous) => previous + 1)}
                  className="mt-4 rounded-full bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {featuredProfessionals.length > 0 ? (
                  featuredProfessionals.map((professional, index) => (
                    <ProfessionalCard
                      key={professional.uid}
                      id={professional.uid}
                      name={professional.nome}
                      category={professional.categorias[0] ?? 'Profissional'}
                      rating={professional.avaliacaoMedia}
                      reviews={professional.totalAvaliacoes}
                      services={professional.totalServicos}
                      distance={
                        professional.distance != null
                          ? `${professional.distance.toFixed(1)} km`
                          : 'Distância indisponível'
                      }
                      image={professional.fotoUrl}
                      badgeLabel={
                        hasRealLocation && index === 0 &&
                        professional.distance != null
                          ? 'Mais perto'
                          : undefined
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-[24px] bg-[var(--color-bg-light)] p-6 text-center text-slate-600">
                    <p className="font-semibold">
                      Nenhum profissional encontrado nesta área ainda.
                    </p>
                    {radiusSearch ? (
                      <p className="mt-1 text-xs text-slate-500">
                        Nada num raio de {radiusSearch.radius} km
                        {manualAddressLabel
                          ? ` de ${manualAddressLabel}`
                          : ''}
                        . Tente outro CEP ou bairro.
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        Tente outro CEP ou bairro.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

          <aside className="space-y-4">
            {/* Cartão visível mesmo enquanto o GPS está pendente:
                o usuário pode buscar por CEP/bairro sem esperar. */}
            {(location.error || !effectiveLocation) && (
              <div className="rounded-[32px] bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Localização
                </p>

                {location.error ? (
                  <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 ring-1 ring-amber-200">
                    {location.error}
                  </p>
                ) : null}

                {manualLocation ? (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm text-slate-700">
                      Buscando perto de:{' '}
                      <strong>{manualAddressLabel}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleRelocate}
                        className="rounded-full bg-[var(--color-navy)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Usar minha localização
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualLocation(null);
                          setManualAddressLabel('');
                        }}
                        className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLocationLookup} className="mt-3 space-y-2">
                    <p className="text-sm text-slate-600">
                      Informe seu CEP ou bairro para achar profissionais mais
                      próximos:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="CEP ou bairro"
                        value={locationInput}
                        onChange={(event) => {
                          const value = event.target.value;
                          setLocationInput(
                            /^\d*$/.test(value.replace(/\D/g, '')) &&
                              onlyNumbers(value).length > 0
                              ? applyCepMask(value)
                              : value
                          );
                          setLocationLookupError('');
                        }}
                        className="w-full min-w-0 flex-1 rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-3 text-sm text-slate-800 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                      />
                      <button
                        type="submit"
                        disabled={
                          locationLookupLoading ||
                          (onlyNumbers(locationInput).length !== 8 &&
                            locationInput.trim().length < 3)
                        }
                        className="shrink-0 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {locationLookupLoading ? 'Buscando…' : 'Buscar'}
                      </button>
                    </div>
                    {locationLookupError ? (
                      <p className="text-xs text-rose-600">{locationLookupError}</p>
                    ) : null}
                  </form>
                )}
              </div>
            )}

            <div className="rounded-[32px] bg-[var(--color-navy)] p-5 text-white shadow-[0_24px_80px_rgba(26,43,76,0.18)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Destaque</p>
              <h2 className="mt-3 text-2xl font-bold">Precisa de ajuda rápida?</h2>
              <p className="mt-2 text-sm text-white/80">Peça um orçamento com descrição e receba retorno de quem já está disponível.</p>
              <Link
                to="/buscar"
                className="mt-4 inline-flex w-full items-center justify-center rounded-[24px] bg-[var(--color-primary)] px-4 py-4 text-sm font-semibold text-[var(--color-navy)] shadow-sm"
              >
                Solicitar orçamento imediato
              </Link>
            </div>
          </aside>
      </main>
    </div>
  );
};

export default HomePage;
