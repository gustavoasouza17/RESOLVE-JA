import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';
import { db } from '../../firebase';
import { getProposalById, updateProposalStatus } from '../../services/proposals';
import { createNotification } from '../../services/notifications';
import type { MockProposal } from '../../constants/mockProposals';

function getAuthUser() {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as { uid: string; fullName: string; profile: string };
  } catch {
    return null;
  }
}

const ProposalPage = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<MockProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!proposalId) {
      setLoading(false);
      return;
    }

    const fetchProposal = async () => {
      try {
        const data = await getProposalById(proposalId);
        setProposal(data);
      } catch {
        setError('Não foi possível carregar a proposta solicitada.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [proposalId]);

  const handleReject = async () => {
    if (!proposalId) return;

    setRejecting(true);
    setError('');

    try {
      await updateProposalStatus(proposalId, 'recusada');

      if (proposal) {
        const authUser = getAuthUser();
        let categoria = 'serviço';
        try {
          const profSnap = await getDoc(doc(db, 'professionals', proposal.prestadorId));
          if (profSnap.exists()) {
            const data = profSnap.data() as Record<string, unknown>;
            const cats = data.categorias as string[] | undefined;
            if (Array.isArray(cats) && cats.length > 0) {
              categoria = cats[0];
            }
          }
        } catch {
          // ignora erro na busca de categoria
        }

        await createNotification({
          destinatarioId: proposal.clienteId,
          tipo: 'proposta_recusada',
          titulo: 'Sua proposta foi recusada',
          mensagem: `${authUser?.fullName || 'O prestador'} recusou sua solicitação de ${categoria}`,
          referenciaId: proposalId,
        });
      }

      navigate('/prestador/solicitacoes');
    } catch {
      setError('Não foi possível recusar a proposta. Tente novamente.');
      setRejecting(false);
    }
  };

  const handleAccept = async () => {
    if (!proposalId) return;

    setAccepting(true);
    setError('');

    try {
      await updateProposalStatus(proposalId, 'aceita');

      if (proposal) {
        const authUser = getAuthUser();
        let categoria = 'serviço';
        try {
          const profSnap = await getDoc(doc(db, 'professionals', proposal.prestadorId));
          if (profSnap.exists()) {
            const data = profSnap.data() as Record<string, unknown>;
            const cats = data.categorias as string[] | undefined;
            if (Array.isArray(cats) && cats.length > 0) {
              categoria = cats[0];
            }
          }
        } catch {
          // ignora erro na busca de categoria
        }

        await createNotification({
          destinatarioId: proposal.clienteId,
          tipo: 'proposta_aceita',
          titulo: 'Sua proposta foi aceita',
          mensagem: `${authUser?.fullName || 'O prestador'} aceitou sua solicitação de ${categoria}`,
          referenciaId: proposalId,
        });
      }

      setProposal((prev) => prev ? { ...prev, status: 'aceita' } : null);
    } catch {
      setError('Não foi possível aceitar a proposta. Tente novamente.');
      setAccepting(false);
    }
  };

  const handleStartService = async () => {
    if (!proposalId) return;

    setStarting(true);
    setError('');

    try {
      await updateProposalStatus(proposalId, 'em_andamento');

      if (proposal) {
        const authUser = getAuthUser();
        await createNotification({
          destinatarioId: proposal.clienteId,
          tipo: 'servico_iniciado',
          titulo: 'Serviço iniciado',
          mensagem: `${authUser?.fullName || 'O prestador'} iniciou o serviço solicitado`,
          referenciaId: proposalId,
        });
      }

      setProposal((prev) => prev ? { ...prev, status: 'em_andamento' } : null);
    } catch {
      setError('Não foi possível iniciar o serviço. Tente novamente.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] text-[var(--color-navy)]">
        <p className="text-sm text-slate-600">Carregando proposta…</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] px-5">
        <div className="rounded-[28px] bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
          <p className="font-semibold">Proposta não encontrada.</p>
          <p className="mt-2">A proposta solicitada não foi localizada no banco de dados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Proposta</p>
                <h1 className="mt-4 text-3xl font-bold tracking-tight">Detalhes da proposta do cliente</h1>
              </div>

              <div className="rounded-[32px] bg-[var(--color-bg-light)] p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={proposal.clienteNome || 'Cliente'} size="md" />
                  <div>
                    <p className="font-semibold text-[var(--color-navy)]">{proposal.clienteNome || `Cliente ${proposal.clienteId}`}</p>
                    <p className="text-sm text-slate-600">Solicitação em {proposal.endereco || 'local indicado pelo cliente'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <StarRating value={4.7} readOnly size="sm" />
                  <span className="text-sm text-slate-600">4.7 avaliação média</span>
                </div>
              </div>

              <div className="space-y-4 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Descrição</p>
                  <p className="mt-3 text-slate-700">{proposal.descricao}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Endereço</p>
                    <p className="mt-2 text-slate-700">{proposal.endereco}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Data desejada</p>
                    <p className="mt-2 text-slate-700">
                      {proposal.dataDesejada ? new Date(proposal.dataDesejada).toLocaleDateString('pt-BR') : 'Não informada'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Orçamento sugerido</p>
                  <p className="mt-2 text-slate-700">R$ {proposal.orcamentoCliente.toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-[32px] bg-[var(--color-bg-light)] p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ações</p>
                {error && (
                  <div className="mt-4 rounded-2xl bg-red-50 p-3 text-xs text-red-700 ring-1 ring-red-200">
                    {error}
                  </div>
                )}
                <div className="mt-6 space-y-3">
                  {proposal.status === 'pendente' && (
                    <>
                      <Button fullWidth variant="primary" onClick={handleAccept} disabled={accepting}>
                        {accepting ? 'Aceitando…' : 'Aceitar e chamar no WhatsApp'}
                      </Button>
                      <Button fullWidth variant="secondary" onClick={handleReject} disabled={rejecting}>
                        {rejecting ? 'Recusando…' : 'Recusar proposta'}
                      </Button>
                    </>
                  )}
                  {proposal.status === 'aceita' && (
                    <>
                      <Button fullWidth variant="primary" onClick={handleStartService} disabled={starting}>
                        {starting ? 'Iniciando…' : 'Iniciar Serviço'}
                      </Button>
                      <p className="text-xs text-slate-500 text-center mt-2">Clique para marcar como em andamento</p>
                    </>
                  )}
                  {proposal.status === 'em_andamento' && (
                    <div className="rounded-2xl bg-blue-50 p-4 text-center">
                      <p className="text-sm font-semibold text-blue-900">✓ Serviço em andamento</p>
                      <p className="text-xs text-blue-700 mt-1">O cliente será notificado quando você marcar como concluído</p>
                    </div>
                  )}
                  {proposal.status === 'concluido' && (
                    <div className="rounded-2xl bg-green-50 p-4 text-center">
                      <p className="text-sm font-semibold text-green-900">✓ Serviço concluído</p>
                      <p className="text-xs text-green-700 mt-1">Aguardando avaliação do cliente</p>
                    </div>
                  )}
                  {proposal.status === 'recusada' && (
                    <div className="rounded-2xl bg-red-50 p-4 text-center">
                      <p className="text-sm font-semibold text-red-900">✗ Proposta recusada</p>
                      <p className="text-xs text-red-700 mt-1">Esta proposta foi recusada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Notas</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">Confirme disponibilidade de agenda antes de aceitar e mantenha o cliente informado sobre prazos e materiais necessários.</p>
              </div>

              <Link to="/prestador/solicitacoes" className="block rounded-3xl bg-white px-5 py-4 text-center text-sm font-semibold text-[var(--color-primary)] ring-1 ring-slate-200 hover:bg-slate-50">
                Voltar à lista de propostas
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
