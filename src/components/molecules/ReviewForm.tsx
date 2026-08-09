import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Button from '../atoms/Button';
import StarRating from '../atoms/StarRating';
import { db } from '../../firebase';
import mockProposals, { type MockProposal } from '../../constants/mockProposals';
import {
  createReview,
  getReviewByProposalAndAvaliador,
  type Review,
  type ReviewTipo,
} from '../../services/reviews';

type ReviewFormProps = {
  proposalId: string;
  avaliadorId: string;
  tipo: ReviewTipo;
  titulo: string;
  descricao: string;
  backPath: string;
};

const ReviewForm = ({
  proposalId,
  avaliadorId,
  tipo,
  titulo,
  descricao,
  backPath,
}: ReviewFormProps) => {
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<MockProposal | null>(null);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');

      // Busca a proposta no Firestore; se não existir, usa o mock
      let prop: MockProposal | null = null;
      try {
        const snap = await getDoc(doc(db, 'proposals', proposalId));
        if (snap.exists()) {
          const d = snap.data() as Record<string, unknown>;
          prop = {
            id: proposalId,
            clienteId: (d.clienteId as string) ?? '',
            clienteNome: (d.clienteNome as string) ?? '',
            prestadorId: (d.prestadorId as string) ?? '',
            descricao: (d.descricao as string) ?? '',
            endereco: (d.endereco as string) ?? '',
            dataDesejada: (d.dataDesejada as string) ?? '',
            orcamentoCliente: Number(d.orcamentoCliente) || 0,
            contraPropostaPrestador: d.contraPropostaPrestador as number | undefined,
            status: (d.status as MockProposal['status']) ?? 'pendente',
            criadoEm: (d.criadoEm as string) ?? new Date().toISOString(),
            atualizadoEm: d.atualizadoEm as string | undefined,
          };
        }
      } catch {
        // Sem permissão ou erro de rede — usa mock
      }

      if (!prop) {
        prop = mockProposals.find((p) => p.id === proposalId) ?? null;
      }

      if (!cancelled) setProposal(prop);

      // Verifica se já existe avaliação deste avaliador para esta proposta
      const review = await getReviewByProposalAndAvaliador(proposalId, avaliadorId);
      if (!cancelled) {
        setExistingReview(review);
        if (review) {
          setNota(review.nota);
          setComentario(review.comentario);
        }
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [proposalId, avaliadorId]);

  const avaliadoId =
    tipo === 'cliente_para_prestador'
      ? proposal?.prestadorId
      : proposal?.clienteId;

  const handleSubmit = async () => {
    if (!proposal || !avaliadoId) return;
    if (nota < 1 || nota > 5) {
      setError('Selecione uma nota entre 1 e 5 estrelas.');
      return;
    }
    if (comentario.length > 500) {
      setError('O comentário deve ter no máximo 500 caracteres.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createReview({
        proposalId,
        avaliadorId,
        avaliadoId,
        tipo,
        nota,
        comentario: comentario.trim(),
      });
      setSaved(true);
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      setError('Não foi possível salvar sua avaliação. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => navigate(backPath);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[28px] bg-white p-10 text-center shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
        <p className="text-sm text-slate-600">Carregando avaliação…</p>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="rounded-[28px] bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200">
        <p className="font-semibold">Proposta não encontrada.</p>
        <Button variant="secondary" className="mt-4" onClick={handleSkip}>
          Voltar
        </Button>
      </div>
    );
  }

  if (proposal.status !== 'concluido') {
    return (
      <div className="rounded-[28px] bg-amber-50 p-6 text-sm text-amber-800 ring-1 ring-amber-200">
        <p className="font-semibold">Avaliação disponível após a conclusão do serviço.</p>
        <p className="mt-1">
          Esta proposta ainda não está finalizada. Você poderá avaliar assim que o
          status for "concluído".
        </p>
        <Button variant="secondary" className="mt-4" onClick={handleSkip}>
          Voltar
        </Button>
      </div>
    );
  }

  if (saved || existingReview) {
    const review = existingReview;
    return (
      <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
          Avaliação
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{titulo}</h1>

        <div className="mt-8 rounded-[28px] bg-emerald-50 p-6 text-sm text-emerald-800 ring-1 ring-emerald-200">
          {existingReview
            ? 'Você já avaliou este serviço. Obrigado pelo seu feedback!'
            : 'Avaliação enviada com sucesso! Obrigado pelo seu feedback.'}
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Sua nota</p>
            <StarRating value={review ? review.nota : nota} readOnly size="lg" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Seu comentário</p>
            <div className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-4 text-sm leading-6 text-slate-700">
              {review ? review.comentario || 'Sem comentário.' : comentario || 'Sem comentário.'}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleSkip}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
        Avaliação
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-600">{descricao}</p>

      <div className="mt-10 space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-700">Como foi o serviço?</p>
          <StarRating value={nota} onChange={setNota} size="lg" />
          {nota === 0 && (
            <p className="text-xs text-slate-400">
              Toque nas estrelas para escolher sua nota.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="comment" className="block text-sm font-semibold text-slate-900">
              Comentário (opcional)
            </label>
            <span className="text-xs text-slate-400">{comentario.length}/500</span>
          </div>
          <textarea
            id="comment"
            rows={6}
            maxLength={500}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Escreva sua experiência..."
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={handleSkip}>
            Pular
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving || nota === 0}>
            {saving ? 'Enviando...' : 'Enviar avaliação'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;