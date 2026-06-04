import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import categories from '../../constants/categories';
import mockProfessionals from '../../constants/mockProfessionals';
import mockProposals from '../../constants/mockProposals';

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
    subtitle: `Serviços de ${category.nome.toLowerCase()}`,
    icon: iconMap[category.icone] ?? '🔧',
  }));

const OnboardingPage = () => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const averageRating = (
    mockProfessionals.reduce((sum, professional) => sum + professional.avaliacaoMedia, 0) /
    mockProfessionals.length
  ).toFixed(1);

  const stats = [
    { value: `${mockProfessionals.length}+`, label: 'Profissionais' },
    { value: averageRating, label: 'Avaliação média' },
    { value: `${mockProposals.length * 4}k+`, label: 'Atendimentos' },
  ];

  const professionalsPreview = mockProfessionals.slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Resolve Já</p>
          <p className="text-lg font-semibold">Conectando você aos melhores profissionais</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="hidden rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 md:inline-flex"
          >
            Acesso Admin
          </Link>
          <Link to="/login">
            <Button variant="primary">Entrar / Cadastrar</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-navy)] shadow-sm">
              ✨ Conectando você aos melhores profissionais
            </span>

            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Buscando qual <span className="text-[var(--color-primary)]">serviço?</span>
              </h1>
              <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
                Encontre profissionais qualificados, avaliados e próximos de você em segundos. Compare serviços, veja avaliações reais e comece a conversar via WhatsApp sem sair do app.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/login">
                <Button className="w-full sm:w-auto" variant="primary">
                  Começar agora
                </Button>
              </Link>
              <Link to="/buscar">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Ver categorias
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Visão rápida</p>
                <p className="text-xl font-bold text-[var(--color-navy)]">Mapa ou lista, você escolhe</p>
              </div>
              <div className="rounded-2xl bg-[var(--color-bg-light)] px-3 py-2 text-sm font-semibold text-slate-700">
                {viewMode === 'list' ? 'Lista ativa' : 'Mapa ativo'}
              </div>
            </div>

            <div className="mt-6 flex gap-3 rounded-2xl bg-slate-100 p-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'list' ? 'bg-[var(--color-navy)] text-white' : 'bg-transparent text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ver Lista
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  viewMode === 'map' ? 'bg-[var(--color-navy)] text-white' : 'bg-transparent text-slate-700 hover:bg-slate-200'
                }`}
              >
                Ver Mapa
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {viewMode === 'list' ? (
                <div className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-semibold text-slate-500">Profissionais próximos</p>
                    <div className="mt-4 space-y-3">
                      {professionalsPreview.map((professional) => (
                        <div key={professional.uid} className="rounded-3xl bg-white p-4 shadow-sm">
                          <p className="font-semibold text-slate-900">{professional.nome} · {professional.categorias[0]}</p>
                          <p className="text-sm text-slate-500">{professional.distanciaKm.toFixed(1)} km · {professional.avaliacaoMedia} ★</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-50" />
                  <p className="mt-4 text-sm text-slate-600">Veja os profissionais mais próximos na sua região com um mapa intuitivo.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Categorias populares</p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--color-navy)]">Encontre o serviço certo</h2>
              </div>
              <div className="rounded-2xl bg-[var(--color-bg-light)] px-3 py-2 text-sm text-slate-700">6 opções</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {categoryCards.map((category) => (
                <article key={category.title} className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 transition hover:border-[var(--color-primary)] hover:bg-white">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-[var(--color-primary)]/10 text-2xl">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{category.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{category.subtitle}</p>
                  <div className="mt-4 text-sm font-semibold text-[var(--color-primary)]">Ver profissionais →</div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-6 rounded-[32px] bg-[var(--color-navy)] p-6 text-white shadow-lg shadow-slate-900/10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Estatísticas</p>
            <h2 className="text-2xl font-bold">Mais segurança em suas pesquisas</h2>
            <p className="text-sm text-slate-200">Resultados rápidos, profissionais verificados e avaliações reais. Tudo em um só lugar.</p>

            <div className="grid gap-4 pt-4 sm:grid-cols-1">
              {stats.map((item) => (
                <div key={item.label} className="rounded-3xl bg-white/10 p-4">
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{item.label}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default OnboardingPage;
