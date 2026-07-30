import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import StarRating from '../../components/atoms/StarRating';
import BottomNav from '../../components/organisms/BottomNav';
import mockProposals, { type MockProposal } from '../../constants/mockProposals';
import mockProfessionals, { type MockProfessional } from '../../constants/mockProfessionals';

// ─── Types ────────────────────────────────────────────────────────────────────

type HistoryItem = {
  id: string;
  service: string;
  status: string;
  date: string;
  professionalName: string;
  category: string;
  professionalPhoto: string;
};

type RecommendedPro = {
  uid: string;
  nome: string;
  categoria: string;
  fotoUrl: string;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  totalServicos: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLIENTE_ID = 'client001';

function getStatusLabel(status: MockProposal['status']): string {
  switch (status) {
    case 'pendente':
      return 'Em andamento';
    case 'aceita':
      return 'Concluído';
    case 'recusada':
      return 'Cancelado';
    default:
      return status;
  }
}

function getStatusVariant(status: MockProposal['status']): 'success' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'aceita':
      return 'success';
    case 'pendente':
      return 'warning';
    case 'recusada':
      return 'danger';
    default:
      return 'default';
  }
}

function buildHistory(): HistoryItem[] {
  const professionalMap = new Map<string, MockProfessional>();
  for (const p of mockProfessionals) {
    professionalMap.set(p.uid, p);
  }

  return mockProposals
    .filter((proposal) => proposal.clienteId === CLIENTE_ID)
    .sort((a, b) => new Date(b.dataDesejada).getTime() - new Date(a.dataDesejada).getTime())
    .map((proposal) => {
      const prof = professionalMap.get(proposal.prestadorId);
      const category = prof?.categorias?.[0] ?? 'Profissional';
      return {
        id: proposal.id,
        service: proposal.descricao,
        status: getStatusLabel(proposal.status),
        date: new Date(proposal.dataDesejada).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        professionalName: prof?.nome ?? 'Profissional',
        category,
        professionalPhoto: prof?.fotoUrl ?? '',
      };
    });
}

function getRecommendedProfessionals(): RecommendedPro[] {
  // 1. Find all proposals for this client
  const clientProposals = mockProposals.filter((p) => p.clienteId === CLIENTE_ID);

  if (clientProposals.length < 2) return [];

  // 2. Count categories from the professionals the client has hired
  const professionalMap = new Map<string, MockProfessional>();
  for (const p of mockProfessionals) {
    professionalMap.set(p.uid, p);
  }

  const categoryCount = new Map<string, number>();
  const contractedIds = new Set<string>();

  for (const proposal of clientProposals) {
    const prof = professionalMap.get(proposal.prestadorId);
    contractedIds.add(proposal.prestadorId);
    if (prof?.categorias?.length) {
      const mainCat = prof.categorias[0];
      categoryCount.set(mainCat, (categoryCount.get(mainCat) ?? 0) + 1);
    }
  }

  // 3. Find the most frequent category (appearing at least 2 times)
  let topCategory = '';
  let topCount = 0;
  for (const [cat, count] of categoryCount.entries()) {
    if (count > topCount) {
      topCount = count;
      topCategory = cat;
    }
  }

  // If no category appears at least 2 times, don't show recommendations
  if (topCount < 2 || !topCategory) return [];

  // 4. Find professionals from that category that the client hasn't contracted
  const recommended = mockProfessionals
    .filter(
      (prof) =>
        prof.status === 'ativo' &&
        prof.categorias.includes(topCategory) &&
        !contractedIds.has(prof.uid),
    )
    .map((prof) => ({
      uid: prof.uid,
      nome: prof.nome,
      categoria: topCategory,
      fotoUrl: prof.fotoUrl,
      avaliacaoMedia: prof.avaliacaoMedia,
      totalAvaliacoes: prof.totalAvaliacoes,
      totalServicos: prof.totalServicos,
    }));

  // If no matching professionals found, return top-rated active professionals
  if (recommended.length === 0) {
    return mockProfessionals
      .filter((prof) => prof.status === 'ativo' && !contractedIds.has(prof.uid))
      .sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia)
      .slice(0, 4)
      .map((prof) => ({
        uid: prof.uid,
        nome: prof.nome,
        categoria: prof.categorias[0] ?? 'Profissional',
        fotoUrl: prof.fotoUrl,
        avaliacaoMedia: prof.avaliacaoMedia,
        totalAvaliacoes: prof.totalAvaliacoes,
        totalServicos: prof.totalServicos,
      }));
  }

  return recommended.slice(0, 4);
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ label, variant }: { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }) {
  const colors: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    default: 'bg-slate-50 text-slate-700 ring-slate-200',
  };

  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ClientRequestsPage = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [recommended, setRecommended] = useState<RecommendedPro[]>([]);

  useEffect(() => {
    setHistoryItems(buildHistory());
    setRecommended(getRecommendedProfessionals());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="client" />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          {/* ─── Main column: History ─────────────────────────────────── */}
          <section className="space-y-8">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Histórico de serviços
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Acompanhe suas solicitações realizadas e o status de cada uma.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {historyItems.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                    <p className="text-base font-semibold text-slate-500">
                      Nenhum serviço solicitado ainda.
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      Busque profissionais e solicite seu primeiro serviço!
                    </p>
                    <Link
                      to="/buscar"
                      className="mt-4 inline-block rounded-2xl bg-[var(--color-primary)] px-6 py-3 text-sm font-bold text-[var(--color-navy)] shadow-lg shadow-[var(--color-primary)]/30 transition hover:brightness-95"
                    >
                      Buscar profissionais
                    </Link>
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] p-5 transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar
                            name={item.professionalName}
                            size="md"
                            src={item.professionalPhoto || undefined}
                          />
                          <div className="space-y-1">
                            <p className="font-semibold text-[var(--color-navy)]">
                              {item.service}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                              <span>{item.professionalName}</span>
                              <span className="text-slate-300">•</span>
                              <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400">{item.date}</p>
                          </div>
                        </div>
                        <StatusBadge label={item.status} variant={getStatusVariant(item.status as MockProposal['status'])} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ─── Sidebar: Recommendations ─────────────────────────────── */}
          <aside className="space-y-6">
            {recommended.length > 0 && (
              <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Profissionais recomendados
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Baseado no seu histórico de serviços
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {recommended.map((pro) => (
                    <Link
                      key={pro.uid}
                      to={`/profissional/${pro.uid}`}
                      className="block rounded-3xl bg-[var(--color-bg-light)] p-4 transition hover:shadow-md hover:ring-1 hover:ring-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar
                          name={pro.nome}
                          size="md"
                          src={pro.fotoUrl || undefined}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-navy)] truncate">
                            {pro.nome}
                          </p>
                          <p className="text-sm text-slate-500">{pro.categoria}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <StarRating value={pro.avaliacaoMedia} readOnly size="sm" />
                            <span className="text-xs text-slate-400">
                              ({pro.totalAvaliacoes})
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Resumo
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Total de serviços</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">
                    {historyItems.length}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Concluídos</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {historyItems.filter((i) => i.status === 'Concluído').length}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Em andamento</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-600">
                    {historyItems.filter((i) => i.status === 'Em andamento').length}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientRequestsPage;