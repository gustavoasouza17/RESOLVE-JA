import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button';
import Input from '../../components/atoms/Input';
import mockProfessionals from '../../constants/mockProfessionals';
import { db } from '../../firebase';
import { createProposal } from '../../services/proposals';

// ─── Helper: lê o usuário logado do localStorage ───────────────────────────────
function getAuthUser() {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as {
      uid: string;
      fullName: string;
      email: string;
      profile: string;
    };
  } catch {
    return null;
  }
}

const RequestPage = () => {
  const { profissionalId } = useParams();
  const navigate = useNavigate();
  const [professional, setProfessional] = useState(
    () =>
      mockProfessionals.find((p) => p.uid === profissionalId) ??
      mockProfessionals[0],
  );

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isOpenRequest, setIsOpenRequest] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (!profissionalId) return;

    const mockProfessional = mockProfessionals.find((p) => p.uid === profissionalId);
    if (mockProfessional) {
      setProfessional(mockProfessional);
      if (mockProfessional.categorias?.[0]) {
        setCategory(mockProfessional.categorias[0]);
      }
      return;
    }

    let cancelled = false;

    const loadProfessional = async () => {
      try {
        const snap = await getDoc(doc(db, 'professionals', profissionalId));
        if (!snap.exists() || cancelled) return;

        const data = snap.data() as Record<string, unknown>;

        setProfessional({
          uid: profissionalId,
          userId: (data.userId as string) ?? profissionalId,
          nome: (data.nome as string) ?? 'Prestador',
          bio: (data.bio as string) ?? 'Prestador cadastrado.',
          fotoUrl: (data.fotoUrl as string) ?? '',
          whatsapp: (data.whatsapp as string) ?? '',
          categorias: Array.isArray(data.categorias)
            ? (data.categorias as string[])
            : ['Prestador'],
          bairrosAtendimento: Array.isArray(data.bairrosAtendimento)
            ? (data.bairrosAtendimento as string[])
            : [],
          portfolio: Array.isArray(data.portfolio)
            ? (data.portfolio as string[])
            : [],
          disponibilidade: (data.disponibilidade as Record<string, string[]>) ?? {},
          totalServicos: Number(data.totalServicos) || 0,
          distanciaKm: Number(data.distanciaKm) || 0,
          avaliacaoMedia: Number(data.avaliacaoMedia) || 0,
          totalAvaliacoes: Number(data.totalAvaliacoes) || 0,
          valorDiaria: (data.valorDiaria as string) ?? 'Sob consulta',
          plano: (data.plano as 'free' | 'premium') ?? 'free',
          status: (data.status as 'ativo' | 'inativo') ?? 'ativo',
          criadoEm: (data.criadoEm as string) ?? new Date().toISOString(),
        });
        if (Array.isArray(data.categorias) && data.categorias.length > 0) {
          setCategory(data.categorias[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar prestador para a proposta:', error);
      }
    };

    loadProfessional();

    return () => {
      cancelled = true;
    };
  }, [profissionalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim() || !address.trim() || !date || !budget) {
      setError('Preencha todos os campos antes de enviar.');
      return;
    }

    const authUser = getAuthUser();
    if (!authUser) {
      setError('Você precisa estar logado para enviar uma proposta.');
      return;
    }

    setSubmitting(true);
    try {
      const targetProfessionalId = isOpenRequest ? '' : (professional?.uid ?? profissionalId ?? mockProfessionals[0].uid);
      const targetCategory = isOpenRequest ? category : (professional?.categorias?.[0] ?? '');

      await createProposal({
        prestadorId: targetProfessionalId,
        clienteId: authUser.uid,
        clienteNome: authUser.fullName || authUser.email,
        descricao: description.trim(),
        endereco: address.trim(),
        dataDesejada: date,
        orcamentoCliente: Number(budget),
        categoria: targetCategory,
      });
      setSuccess(true);
      // Redireciona para home com flag de sucesso após 1.5s
      setTimeout(() => navigate('/home', { state: { proposalSent: true } }), 1500);
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar proposta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Enviar proposta
              </p>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">
                Descreva o serviço desejado
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Adicione detalhes para que o prestador entenda o trabalho e envie um orçamento preciso.
              </p>
            </div>

            {/* Sucesso */}
            {success && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 font-semibold">
                ✅ Proposta enviada com sucesso! Redirecionando…
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
                  Descrição do serviço
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="Explique o que precisa ser feito, o local e o prazo desejado"
                />
              </div>

              <Input
                label="Endereço"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua das Flores, 123 - São Paulo, SP"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-slate-900">
                    Data desejada
                  </label>
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <Input
                  label="Orçamento estimado"
                  name="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="R$ 800,00"
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="requestType"
                      checked={!isOpenRequest}
                      onChange={() => setIsOpenRequest(false)}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    Enviar para este profissional
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="requestType"
                      checked={isOpenRequest}
                      onChange={() => setIsOpenRequest(true)}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    Publicar como pedido aberto
                  </label>
                </div>
                <Button type="submit" variant="primary" disabled={submitting || success}>
                  {submitting ? 'Enviando…' : 'Enviar proposta'}
                </Button>
              </div>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Dados do prestador
              </p>
              <div className="mt-5 space-y-3">
                <p className="text-lg font-semibold text-[var(--color-navy)]">
                  {professional.nome}
                </p>
                <p className="text-sm text-slate-600">{professional.bio}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avaliação</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">
                      {professional.avaliacaoMedia} ★
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Serviços</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">
                      {professional.totalServicos}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Dica
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Descreva o máximo possível. Detalhes sobre local, prazo e materiais ajudam o
                prestador a entregar um orçamento mais preciso.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="block w-full rounded-3xl bg-[var(--color-primary)]/10 px-5 py-4 text-sm font-semibold text-[var(--color-navy)] hover:bg-[var(--color-primary)]/15"
            >
              Voltar ao início
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RequestPage;
