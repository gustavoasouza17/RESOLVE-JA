import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import CategoryCard from '../../components/molecules/CategoryCard';
import StatsBanner from '../../components/molecules/StatsBanner';
import Navbar from '../../components/organisms/Navbar';
import MapView from '../../components/organisms/MapView';
import type {
  MapClientLocation,
  MapProfessional,
} from '../../components/organisms/MapView';
import categories from '../../constants/categories';
import { getProfessionals, type ProfessionalCardData } from '../../services/professionals';
import { resolveCepLocation } from '../../services/geocoding';
import { haversineKm } from '../../utils/geo';
import { withTimeout } from '../../utils/async';
import {
  applyCepMask,
  isCompleteCep,
  onlyNumbers,
} from '../../utils/cep';

/** Timeout de segurança para as etapas de rede (ViaCEP, geocoding, Firestore). */
const LOOKUP_TIMEOUT_MS = 10000;

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

const categoryCards = categories
  .filter((category) => category.ativa)
  .slice(0, 6)
  .map((category) => ({
    title: category.nome,
    subtitle: 'Profissionais verificados e avaliados',
    icon: iconMap[category.icone] ?? '🔧',
    to: `/buscar/${encodeURIComponent(category.nome.toLowerCase())}`,
  }));

type LocatedProfessional = ProfessionalCardData & {
  distance: number | null;
};

const OnboardingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { userName?: string; profile?: string } | null;
  const userName = state?.userName;

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [professionals, setProfessionals] = useState<ProfessionalCardData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // CEP lookup states (consulta pública — sem login, sem gravar no Firestore)
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState('');
  const [submittedCep, setSubmittedCep] = useState<string | null>(null);
  const [foundAddress, setFoundAddress] = useState<{
    bairro: string;
    localidade: string;
    uf: string;
  } | null>(null);
  /** Coordenadas do CEP pesquisado (ViaCEP + Nominatim — mesma função do perfil). */
  const [searchedLocation, setSearchedLocation] =
    useState<MapClientLocation | null>(null);
  /** Resultados da busca por CEP (null = ainda não buscou). */
  const [cepResults, setCepResults] = useState<LocatedProfessional[] | null>(null);
  const [cepSearching, setCepSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleCepChange = (value: string) => {
    const masked = applyCepMask(value);
    setCepInput(masked);
    if (cepError) setCepError('');
  };

  const handleCepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void performCepSearch(onlyNumbers(cepInput));
  };

  const performCepSearch = async (numbers: string) => {
    if (!isCompleteCep(numbers)) {
      setCepError('CEP inválido. Verifique e tente novamente.');
      return;
    }

    setCepError('');
    setCepSearching(true);

    try {
      // Mesma função CEP → coordenadas usada no fluxo de perfil
      const resolved = await withTimeout(
        resolveCepLocation(numbers),
        LOOKUP_TIMEOUT_MS
      );

      if (!resolved) {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
        return;
      }

      setFoundAddress({
        bairro: resolved.address.bairro,
        localidade: resolved.address.localidade,
        uf: resolved.address.uf,
      });
      setSubmittedCep(numbers);
      setSearchedLocation({
        latitude: resolved.point.latitude,
        longitude: resolved.point.longitude,
        accuracy: null,
      });
      setHasSearched(true);

      // Profissionais que atendem no bairro do CEP (mesma regra da lista)
      const data = await withTimeout(getProfessionals(), LOOKUP_TIMEOUT_MS);
      const targetBairro = resolved.address.bairro.toLowerCase();

      const filtered: LocatedProfessional[] = data
        .filter((prof) =>
          (prof.bairrosAtendimento ?? []).some((bairro) =>
            bairro.toLowerCase().includes(targetBairro)
          )
        )
        .map((prof) => ({
          ...prof,
          distance:
            prof.latitude != null && prof.longitude != null
              ? haversineKm(resolved.point, {
                  latitude: prof.latitude,
                  longitude: prof.longitude,
                })
              : null,
        }))
        .sort(
          (a, b) =>
            (a.distance ?? Number.POSITIVE_INFINITY) -
            (b.distance ?? Number.POSITIVE_INFINITY)
        );

      setCepResults(filtered);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError(
        'Não foi possível buscar a localização. Verifique sua conexão e tente novamente.'
      );
    } finally {
      // Sempre encerra o loading — sucesso, erro ou resultado vazio
      setCepSearching(false);
    }
  };

  const handleCepReset = () => {
    setCepInput('');
    setSubmittedCep(null);
    setFoundAddress(null);
    setSearchedLocation(null);
    setCepResults(null);
    setHasSearched(false);
    setCepError('');
  };

  // Botão "Recentrar mapa": re-geocodifica o CEP pesquisado
  const handleRelocate = () => {
    if (submittedCep) void performCepSearch(submittedCep);
  };

  useEffect(() => {
    let cancelled = false;
    const safetyTimeout = window.setTimeout(() => {
      setLoadingStats((prev) => (prev ? false : prev));
    }, 3000);

    const load = async () => {
      try {
        const data = await getProfessionals();
        if (!cancelled) {
          setProfessionals(data);
        }
      } catch (error) {
        console.warn('Erro ao carregar profissionais:', error);
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      window.clearTimeout(safetyTimeout);
    };
  }, []);

  const averageRating = professionals.length > 0
    ? (professionals.reduce((sum, p) => sum + p.avaliacaoMedia, 0) / professionals.length).toFixed(1)
    : '—';

  const stats = [
    { value: loadingStats ? '…' : `${professionals.length}+`, label: 'Profissionais' },
    { value: loadingStats ? '…' : averageRating, label: 'Avaliação média' },
    { value: loadingStats ? '…' : '100%', label: 'Compromisso' },
  ];

  // Lista: prévia (2 primeiros) sem busca; resultados do CEP após a busca
  const listProfessionals: (ProfessionalCardData & {
    distance?: number | null;
  })[] = cepResults ?? professionals.slice(0, 2);

  // Pins do mapa: somente prestadores com coordenadas reais
  const mapProfessionals: MapProfessional[] = useMemo(() => {
    const source: (ProfessionalCardData & { distance?: number | null })[] =
      cepResults ?? professionals;

    const withCoords = source.filter(
      (
        professional
      ): professional is ProfessionalCardData & {
        distance?: number | null;
        latitude: number;
        longitude: number;
      } =>
        professional.latitude != null && professional.longitude != null
    );

    return withCoords.slice(0, 12).map((professional) => ({
      uid: professional.uid,
      nome: professional.nome,
      categoria: professional.categorias[0] ?? 'Profissional',
      nota: professional.avaliacaoMedia,
      distanciaKm:
        professional.distance != null
          ? professional.distance
          : professional.distanciaKm,
      latitude: professional.latitude,
      longitude: professional.longitude,
    }));
  }, [cepResults, professionals]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <Navbar variant="public" />

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-secondary)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] shadow-[0_12px_32px_rgba(255,217,0,0.16)]">
              ✨ Conectando você aos melhores profissionais
            </span>
            {userName ? (
              <p className="text-sm font-semibold text-[var(--color-navy)]">Olá, {userName}! Seja bem-vindo.</p>
            ) : null}
            <h1 className="max-w-3xl text-4xl font-extrabold leading-[0.95] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
              Buscando qual <span className="text-[var(--color-secondary)]">serviço?</span>
            </h1>
            <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
              Encontre profissionais qualificados, avaliados e próximos de você em segundos. Compare serviços, veja avaliações reais e comece a conversar via WhatsApp sem sair do app.
            </p>

            <div className="rounded-[20px] bg-[var(--color-surface-lowest)]/90 p-5 shadow-[0_16px_48px_rgba(26,43,76,0.06)] backdrop-blur-xl">
              <p className="text-sm font-semibold text-[var(--color-navy)]">💡 Você sabia?</p>
              <p className="mt-2 text-sm text-slate-600">
                Prestadores também podem contratar outros profissionais. A plataforma suporta ambos os perfis.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <StatsBanner metrics={stats} />
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[24px] bg-[var(--color-surface-lowest)] p-6 shadow-[0_24px_80px_rgba(26,43,76,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Categorias populares</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--color-navy)]">Encontre o serviço certo</h2>
              </div>
              <div className="rounded-2xl bg-[var(--color-bg-light)] px-3 py-2 text-sm text-slate-700">
                {categoryCards.length} opções
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {categoryCards.map((category) => (
                <CategoryCard
                  key={category.title}
                  icon={category.icon}
                  label={category.title}
                  description={category.subtitle}
                  to={category.to}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[24px] bg-[var(--color-surface-lowest)] p-6 shadow-[0_24px_80px_rgba(26,43,76,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Visão rápida</p>
                <p className="text-xl font-bold text-[var(--color-navy)]">Mapa ou lista, você escolhe</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-bg-light)] px-3 py-2 text-sm font-semibold text-slate-700">
                {viewMode === 'list' ? 'Lista ativa' : 'Mapa ativo'}
              </div>
            </div>

            <div className="mt-6 flex gap-3 rounded-[16px] bg-[var(--color-surface-low)] p-2" role="tablist" aria-label="Modo de visualização">
              <button
                type="button"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={`flex-1 rounded-[12px] px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'list' ? 'bg-[var(--color-navy)] text-white' : 'bg-transparent text-slate-700 hover:bg-white'
                }`}
              >
                Ver Lista
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'map'}
                onClick={() => setViewMode('map')}
                className={`flex-1 rounded-[12px] px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'map' ? 'bg-[var(--color-navy)] text-white' : 'bg-transparent text-slate-700 hover:bg-white'
                }`}
              >
                Ver Mapa
              </button>
            </div>

            <form onSubmit={handleCepSubmit} className="mt-6 space-y-4 rounded-[20px] bg-white p-4 shadow-[0_10px_24px_rgba(26,43,76,0.04)] ring-1 ring-slate-100">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <Input
                  label="CEP"
                  name="cep"
                  type="text"
                  placeholder="00000-000"
                  value={cepInput}
                  onChange={(e) => handleCepChange(e.target.value)}
                  maxLength={9}
                  className="flex-1"
                  disabled={cepSearching}
                  inputMode="numeric"
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={cepSearching || !isCompleteCep(cepInput)}
                  className="w-full sm:w-auto self-end"
                >
                  {cepSearching ? 'Buscando…' : 'Buscar profissionais'}
                </Button>
              </div>

              {foundAddress && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[20px] bg-[var(--color-bg-light)] p-4 border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-navy)]">Localização encontrada</p>
                    <p className="mt-1 text-sm text-slate-700">
                      <strong>{foundAddress.bairro}</strong>, {foundAddress.localidade} - {foundAddress.uf}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCepReset}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Alterar CEP
                  </button>
                </div>
              )}

              {cepError ? (
                <div className="rounded-[16px] bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
                  <p className="font-semibold">{cepError}</p>
                  <button
                    type="button"
                    onClick={() => void performCepSearch(onlyNumbers(cepInput))}
                    className="mt-3 rounded-full bg-[var(--color-navy)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : null}
            </form>

            <div className="mt-6 space-y-4">
              {/* Lista: mesma busca por CEP, com o mesmo estado vazio */}
              <div className={viewMode === 'list' ? 'space-y-4' : 'hidden'}>
                <div className="rounded-[20px] bg-[var(--color-surface-low)] p-5">
                  <p className="text-sm font-semibold text-slate-500">Profissionais próximos</p>
                  <div className="mt-4 space-y-3">
                    {listProfessionals.length > 0 ? (
                      listProfessionals.map((professional) => (
                        <button
                          key={professional.uid}
                          type="button"
                          onClick={() => navigate(`/profissional/${professional.uid}`)}
                          className="w-full rounded-[16px] bg-white p-4 text-left shadow-[0_10px_24px_rgba(26,43,76,0.04)] transition hover:ring-1 hover:ring-slate-200"
                        >
                          <p className="font-semibold text-slate-900">
                            {professional.nome} · {professional.categorias[0]}
                          </p>
                          <p className="text-sm text-slate-500">
                            {professional.distance != null
                              ? `${professional.distance.toFixed(1)} km`
                              : `${professional.distanciaKm.toFixed(1)} km`}{' '}
                            · {professional.avaliacaoMedia} ★
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-[16px] bg-white p-6 text-center text-slate-600">
                        <p className="font-semibold">
                          Nenhum profissional encontrado nesta área ainda.
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Tente outro CEP ou bairro.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mapa: componente MapView compartilhado com o
                  fluxo de perfil — centraliza no CEP pesquisado,
                  pins com popup e aviso de área vazia. */}
              <div className={viewMode === 'map' ? '' : 'hidden'}>
                <div className="rounded-[20px] bg-[var(--color-surface-low)] p-5">
                  <MapView
                    clientLocation={searchedLocation}
                    professionals={mapProfessionals}
                    onSelectProfessional={(uid) =>
                      navigate(`/profissional/${uid}`)
                    }
                    onRelocate={handleRelocate}
                    visible={viewMode === 'map'}
                    loading={cepSearching && !searchedLocation}
                    loadingData={cepSearching || !hasSearched}
                    emptyMessage="Nenhum profissional encontrado nesta área ainda."
                    emptyMessageDetail="Tente outro CEP ou bairro."
                  />
                  <p className="mt-4 text-sm text-slate-600">
                    Veja os profissionais mais próximos na sua região com um mapa intuitivo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default OnboardingPage;
