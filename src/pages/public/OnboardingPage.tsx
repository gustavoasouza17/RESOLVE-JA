import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import CategoryCard from '../../components/molecules/CategoryCard';
import StatsBanner from '../../components/molecules/StatsBanner';
import Navbar from '../../components/organisms/Navbar';
import ProfessionalCard from '../../components/molecules/ProfessionalCard';
import categories from '../../constants/categories';
import { getProfessionals, type ProfessionalCardData } from '../../services/professionals';
import { applyCepMask, isCompleteCep, fetchAddressByCep } from '../../utils/cep';

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

const OnboardingPage = () => {
  const location = useLocation();
  const state = location.state as { userName?: string; profile?: string } | null;
  const userName = state?.userName;
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [professionals, setProfessionals] = useState<ProfessionalCardData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // CEP lookup states
  const [cepInput, setCepInput] = useState('');
  const [cepError, setCepError] = useState('');
  const [submittedCep, setSubmittedCep] = useState<string | null>(null);
  const [foundAddress, setFoundAddress] = useState<{
    bairro: string;
    localidade: string;
    uf: string;
  } | null>(null);
  const [showProfessionals, setShowProfessionals] = useState(false);
  const [loadingProfessionals, setLoadingProfessionals] = useState(false);
  const [professionalsError, setProfessionalsError] = useState('');

  const handleCepChange = (value: string) => {
    const masked = applyCepMask(value);
    setCepInput(masked);
    if (cepError) setCepError('');
  };

  const handleCepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numbers = onlyNumbers(cepInput);

    if (!isCompleteCep(numbers)) {
      setCepError('CEP inválido. Verifique e tente novamente.');
      return;
    }

    setCepError('');
    setLoadingProfessionals(true);
    setProfessionalsError('');

    try {
      const address = await fetchAddressByCep(numbers);
      if (!address) {
        setCepError('CEP não encontrado. Verifique e tente novamente.');
        setLoadingProfessionals(false);
        return;
      }

      setFoundAddress({
        bairro: address.bairro,
        localidade: address.localidade,
        uf: address.uf,
      });
      setSubmittedCep(numbers);
      setShowProfessionals(true);
      await loadProfessionalsByLocation(address);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar CEP. Tente novamente.');
      setLoadingProfessionals(false);
    }
  };

  const loadProfessionalsByLocation = async (address: { bairro: string; localidade: string; uf: string }) => {
    try {
      const data = await getProfessionals();
      
      // Filter professionals by neighborhood match (case-insensitive)
      const filtered = data.filter((prof) => {
        const bairros = prof.bairrosAtendimento || [];
        const targetBairro = address.bairro.toLowerCase();

        // Match by neighborhood (partial match)
        if (bairros.some((b) => b.toLowerCase().includes(targetBairro))) return true;
        
        return false;
      });

      setProfessionals(filtered);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      setProfessionalsError('Não foi possível carregar os profissionais.');
    } finally {
      setLoadingProfessionals(false);
    }
  };

  const handleCepReset = () => {
    setCepInput('');
    setSubmittedCep(null);
    setFoundAddress(null);
    setShowProfessionals(false);
    setCepError('');
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

  const professionalsPreview = professionals.slice(0, 2);

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

            <div className="flex flex-col gap-4 sm:flex_row sm:items-center">
              <Link to="/buscar">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Ver categorias
                </Button>
              </Link>
            </div>

            <div className="rounded-[20px] bg-[var(--color-surface-lowest)]/90 p-5 shadow-[0_16px_48px_rgba(26,43,76,0.06)] backdrop-blur-xl">
              <p className="text-sm font-semibold text-[var(--color-navy)]">💡 Você sabia?</p>
              <p className="mt-2 text-sm text-slate-600">
                Prestadores também podem contratar outros profissionais. A plataforma suporta ambos os perfis.
              </p>
            </div>
          </div>

          {/* CEP Lookup Form */}
          <div className="rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(26,43,76,0.08)] ring-1 ring-slate-100">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Consulta por CEP</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                  Veja profissionais disponíveis no seu bairro
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Digite seu CEP para encontrar profissionais que atendem na sua região. Não é necessário criar conta.
                </p>
              </div>

              <form onSubmit={handleCepSubmit} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Input
                    label="CEP"
                    name="cep"
                    type="text"
                    placeholder="00000-000"
                    value={cepInput}
                    onChange={(e) => handleCepChange(e.target.value)}
                    error={cepError}
                    maxLength={9}
                    className="flex-1"
                    disabled={loadingProfessionals}
                    inputMode="numeric"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loadingProfessionals || !isCompleteCep(cepInput)}
                    className="w-full sm:w-auto"
                  >
                    {loadingProfessionals ? 'Buscando…' : 'Buscar profissionais'}
                  </Button>
                </div>

                {foundAddress && (
                  <div className="rounded-[20px] bg-[var(--color-bg-light)] p-4 border border-slate-200">
                    <p className="text-sm font-semibold text-[var(--color-navy)]">Localização encontrada</p>
                    <p className="mt-1 text-sm text-slate-700">
                      <strong>{foundAddress.bairro}</strong>, {foundAddress.localidade} - {foundAddress.uf}
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Professionals Results */}
          {showProfessionals && (
            <div className="mt-8 rounded-[24px] bg-white p-6 shadow-[0_16px_48px_rgba(26,43,76,0.08)] ring-1 ring-slate-100">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Resultado da busca</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--color-navy)]">
                    Profissionais disponíveis
                    {submittedCep && foundAddress && (
                      <span className="text-base font-normal text-slate-500 ml-2">
                        em {foundAddress.bairro}, {foundAddress.localidade} - {foundAddress.uf}
                      </span>
                    )}
                  </h2>
                </div>
                <Button variant="outline-danger" onClick={handleCepReset}>
                  Alterar CEP
                </Button>
              </div>

              {loadingProfessionals ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-[var(--color-bg-light)] p-10 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
                  <p className="text-sm text-slate-600">Carregando profissionais…</p>
                </div>
              ) : professionalsError ? (
                <div className="rounded-[28px] bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
                  <p className="font-semibold">Não foi possível carregar os profissionais.</p>
                  <p className="mt-2">{professionalsError}</p>
                  <Button variant="secondary" className="mt-4" onClick={() => loadProfessionalsByLocation(foundAddress!)}>
                    Tentar novamente
                  </Button>
                </div>
              ) : professionals.length === 0 ? (
                <div className="rounded-[28px] bg-[var(--color-bg-light)] p-10 text-center text-sm text-slate-600">
                  Nenhum profissional encontrado para esta região no momento.
                  <p className="mt-2 text-xs text-slate-500">Tente buscar por uma categoria específica ou amplie a região.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {professionals.map((professional) => (
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
                      badgeLabel="Atende na região"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

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

            <div className="mt-6 space-y-4">
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <div className="rounded-[20px] bg-[var(--color-surface-low)] p-5">
                    <p className="text-sm font-semibold text-slate-500">Profissionais próximos</p>
                    <div className="mt-4 space-y-3">
                      {professionalsPreview.map((professional) => (
                        <div key={professional.uid} className="rounded-[16px] bg-white p-4 shadow-[0_10px_24px_rgba(26,43,76,0.04)]">
                          <p className="font-semibold text-slate-900">
                            {professional.nome} · {professional.categorias[0]}
                          </p>
                          <p className="text-sm text-slate-500">
                            {professional.distanciaKm.toFixed(1)} km · {professional.avaliacaoMedia} ★
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] bg-[var(--color-surface-low)] p-5">
                  <div className="aspect-[4/3] rounded-[16px] bg-gradient-to-br from-[var(--color-surface-high)] via-white to-[var(--color-secondary)]/40" />
                  <p className="mt-4 text-sm text-slate-600">
                    Veja os profissionais mais próximos na sua região com um mapa intuitivo.
                  </p>
                </div>
              )}
            </div>
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

          <div className="space-y-4">
            <StatsBanner metrics={stats} />
          </div>
        </section>
      </main>
    </div>
  );
};

function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

export default OnboardingPage;