import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Avatar from '../../components/atoms/Avatar';
import StarRating from '../../components/atoms/StarRating';
import BottomNav from '../../components/organisms/BottomNav';
import { auth } from '../../firebase';
import {
  getServiceHistory,
  getRecommendedProfessionals,
  type ServiceHistoryItem,
  type RecommendedProfessional,
} from '../../services/services';

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusVariant = 'success' | 'warning' | 'danger' | 'default';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusVariant(status: string): StatusVariant {
  switch (status) {
    case 'Concluído':
      return 'success';
    case 'Em andamento':
      return 'warning';
    case 'Cancelado':
      return 'danger';
    default:
      return 'default';
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ label, variant }: { label: string; variant: StatusVariant }) {
  const colors: Record<StatusVariant, string> = {
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

// ─── Loading State ────────────────────────────────────────────────────────────

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-10 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[28px] bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
      <p className="font-semibold">Não foi possível carregar os dados.</p>
      <p className="mt-2">{message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ClientRequestsPage = () => {
  const [historyItems, setHistoryItems] = useState<ServiceHistoryItem[]>([]);
  const [recommended, setRecommended] = useState<RecommendedProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!cancelled) {
          setLoading(false);
          setError('Você precisa estar autenticado para ver suas solicitações.');
        }
        return;
      }

      setLoading(true);
      setError('');

      try {
        const [history, recs] = await Promise.all([
          getServiceHistory(user.uid),
          getRecommendedProfessionals(user.uid),
        ]);

        if (!cancelled) {
          setHistoryItems(history);
          setRecommended(recs);
        }
      } catch (err) {
        console.error('Erro ao carregar solicitações do Firestore:', err);
        if (!cancelled) {
          setError('Não foi possível carregar suas solicitações. Tente novamente em instantes.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
                {loading ? (
                  <LoadingState label="Carregando suas solicitações…" />
                ) : error ? (
                  <ErrorState message={error} />
                ) : historyItems.length === 0 ? (
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
                        <StatusBadge label={item.status} variant={getStatusVariant(item.status)} />
                      </div>
                      {item.status === 'Concluído' && (
                        <div className="mt-4 flex justify-end">
                          <Link
                            to={`/avaliar/${item.id}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-bold text-[var(--color-navy)] shadow-md shadow-[var(--color-primary)]/30 transition hover:brightness-95"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            Avaliar profissional
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ─── Sidebar: Recommendations ─────────────────────────────── */}
          <aside className="space-y-6">
            {!loading && !error && recommended.length > 0 && (
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
                          <p className="text-sm text-slate-500">{pro.categorias[0]}</p>
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
                    {loading ? '—' : historyItems.length}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Concluídos</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {loading ? '—' : historyItems.filter((i) => i.status === 'Concluído').length}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Em andamento</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-600">
                    {loading ? '—' : historyItems.filter((i) => i.status === 'Em andamento').length}
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