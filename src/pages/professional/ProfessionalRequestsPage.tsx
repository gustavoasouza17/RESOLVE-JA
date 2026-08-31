import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Badge from '../../components/atoms/Badge';
import BottomNav from '../../components/organisms/BottomNav';
import type { MockProposal } from '../../constants/mockProposals';
import { getProposalsForPrestador } from '../../services/proposals';
import { deleteProposalById } from '../../services/services';

type ProposalBadgeVariant = 'success' | 'default' | 'danger';

type FilterType = 'todas' | 'pendente' | 'aceita' | 'em_andamento' | 'recusada' | 'concluido';

// ─── Helper: lê o usuário logado do localStorage ──────────────────────────────
function getAuthUser() {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as { uid: string; fullName: string; profile: string };
  } catch {
    return null;
  }
}

const ProfessionalRequestsPage = () => {
  const [filter, setFilter] = useState<FilterType>('todas');
  const [firestoreProposals, setFirestoreProposals] = useState<MockProposal[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Busca propostas reais do Firestore ao montar
  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser?.uid) return;
    getProposalsForPrestador(authUser.uid)
      .then((data) => setFirestoreProposals(data))
      .catch(console.warn);
  }, []);

  const handleDeleteRejectedProposal = async (proposalId: string) => {
    setDeletingId(proposalId);

    try {
      await deleteProposalById(proposalId);
      setFirestoreProposals((current) => current.filter((proposal) => proposal.id !== proposalId));
    } catch (error) {
      console.error('Erro ao excluir proposta recusada:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const allProposals: MockProposal[] = firestoreProposals;

  const filteredProposals = allProposals.filter((proposal) => {
    if (filter === 'todas') return true;
    return proposal.status === filter;
  });

  const pendingCount = allProposals.filter((p) => p.status === 'pendente').length;
  const acceptedCount = allProposals.filter((p) => p.status === 'aceita').length;
  const inProgressCount = allProposals.filter((p) => p.status === 'em_andamento').length;

  const getStatusBadge = (status: MockProposal['status']): { label: string; variant: ProposalBadgeVariant } => {
    switch (status) {
      case 'pendente':
        return { label: 'Nova', variant: 'success' };
      case 'aceita':
        return { label: 'Aceita', variant: 'default' };
      case 'em_andamento':
        return { label: 'Em andamento', variant: 'default' };
      case 'concluido':
        return { label: 'Concluída', variant: 'success' };
      case 'recusada':
        return { label: 'Recusada', variant: 'danger' };
      default:
        return { label: status, variant: 'default' };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="professional" />

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Dashboard do prestador
              </p>
              <h1 className="text-3xl font-bold tracking-tight">Solicitações de Serviços</h1>
              <p className="max-w-2xl text-sm text-slate-600">
                Acompanhe e responda às propostas de clientes recebidas na sua área.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" label={`${pendingCount} novas`} />
              <Badge variant="default" label={`${acceptedCount} aceitas`} />
              <Badge variant="default" label={`${inProgressCount} em andamento`} />
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter('todas')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'todas'
                ? 'bg-[var(--color-navy)] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Todas ({allProposals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pendente')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'pendente'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Novas ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('aceita')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'aceita'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Aceitas ({acceptedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('em_andamento')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'em_andamento'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Em andamento ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('concluido')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'concluido'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Concluídas ({allProposals.filter((p) => p.status === 'concluido').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('recusada')}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${
              filter === 'recusada'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 ring-1 ring-slate-200'
            }`}
          >
            Recusadas ({allProposals.filter((p) => p.status === 'recusada').length})
          </button>
        </div>

        {/* Proposals List */}
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Oportunidades ({filteredProposals.length})
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Propostas enviadas por clientes interessados nos seus serviços.
              </p>
            </div>
          </div>

          {filteredProposals.length > 0 ? (
            <div className="space-y-4">
              {filteredProposals.map((proposal) => {
                const clientName = proposal.clienteNome || `Cliente ${proposal.clienteId.replace('client', '')}`;
                const { label, variant } = getStatusBadge(proposal.status);

                return (
                  <div key={proposal.id} className="rounded-3xl border border-slate-200 p-6 transition hover:shadow-md">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar name={clientName} size="md" />
                        <div>
                          <p className="font-semibold text-lg text-[var(--color-navy)]">{clientName}</p>
                          <p className="mt-1 text-sm text-slate-600">{proposal.descricao}</p>
                          {proposal.endereco && (
                            <p className="mt-2 text-xs text-slate-400">📍 {proposal.endereco}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-left sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Orçamento</p>
                        <p className="text-xl font-bold text-[var(--color-navy)]">R$ {proposal.orcamentoCliente}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={variant} label={label} />
                        {proposal.dataDesejada && (
                          <span className="text-xs text-slate-500">
                            Data desejada: {new Date(proposal.dataDesejada).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {proposal.status === 'concluido' && (
                          <Link
                            to={`/prestador/avaliar/${proposal.id}`}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--color-navy)] shadow-md shadow-[var(--color-primary)]/30 transition hover:brightness-95"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            Avaliar cliente
                          </Link>
                        )}

                        {proposal.status === 'recusada' && (
                          <button
                            type="button"
                            aria-label={`Excluir proposta recusada ${proposal.id}`}
                            onClick={() => handleDeleteRejectedProposal(proposal.id)}
                            disabled={deletingId === proposal.id}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            title="Excluir proposta recusada"
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                              <path d="M9 3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1h2a1 1 0 1 1 0 2H7a1 1 0 0 1 0-2h2Zm-2 5h10l-.8 10.4A2 2 0 0 1 14.2 20H9.8a2 2 0 0 1-1.99-1.6L7 8Zm3 2a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6a1 1 0 0 0-1-1Z" />
                            </svg>
                          </button>
                        )}

                        <Link
                          to={`/prestador/proposta/${proposal.id}`}
                          className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-navy)] hover:text-[var(--color-tertiary)] hover:underline"
                        >
                          Ver detalhes →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--color-bg-light)] p-12 text-center text-slate-500">
              Nenhuma solicitação encontrada neste filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRequestsPage;
