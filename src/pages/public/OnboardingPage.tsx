import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import CategoryCard from '../../components/molecules/CategoryCard';
import StatsBanner from '../../components/molecules/StatsBanner';
import Navbar from '../../components/organisms/Navbar';
import categories from '../../constants/categories';
import { getProfessionals, type ProfessionalCardData } from '../../services/professionals';

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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
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

export default OnboardingPage;
