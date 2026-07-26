import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';
import BottomNav from '../../components/organisms/BottomNav';
import mockProposals from '../../constants/mockProposals';

// ─── Types ────────────────────────────────────────────────────────────────────
type ProposalBadgeVariant = 'success' | 'default';

type WorkPost = {
  id: string;
  title: string;
  description: string;
  category: string;
  imagePreview: string | null;
  createdAt: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────
const proposalCards = mockProposals.slice(0, 2).map((proposal) => {
  const statusLabel =
    proposal.status === 'pendente' ? 'Nova' : proposal.status === 'aceita' ? 'Aceita' : 'Recusada';
  const badgeVariant: ProposalBadgeVariant = proposal.status === 'pendente' ? 'success' : 'default';
  return {
    id: proposal.id,
    client: `Cliente ${proposal.clienteId.replace('client', '')}`,
    service: proposal.descricao,
    value: `R$ ${proposal.orcamentoCliente}`,
    statusLabel,
    badgeVariant,
  };
});

const getUserName = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return 'Profissional';
    const parsed = JSON.parse(raw);
    return parsed.fullName || 'Profissional';
  } catch {
    return 'Profissional';
  }
};

// ─── New Post Modal ───────────────────────────────────────────────────────────
type NewPostModalProps = {
  open: boolean;
  onClose: () => void;
  onPublish: (post: Omit<WorkPost, 'id' | 'createdAt'>) => void;
};

const CATEGORIES = [
  'Pedreiro', 'Encanador', 'Eletricista', 'Marceneiro',
  'Pintor', 'Jardineiro', 'Mecânico', 'Ar-Condicionado', 'Outro',
];

const NewPostModal = ({ open, onClose, onPublish }: NewPostModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImagePreview(null);
    setErrors({});
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Use JPG, PNG ou WebP.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Imagem máxima: 5 MB.' }));
      return;
    }
    setErrors((prev) => ({ ...prev, image: '' }));
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSubmit = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = 'Informe o título do trabalho.';
    if (!description.trim()) nextErrors.description = 'Descreva o trabalho realizado.';
    if (!category) nextErrors.category = 'Selecione uma categoria.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      onPublish({ title: title.trim(), description: description.trim(), category, imagePreview });
      reset();
      onClose();
    }, 600);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(10,18,38,0.6)',
          backdropFilter: 'blur(6px)', zIndex: 300, animation: 'fadeIn 0.18s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#fff', borderRadius: '28px 28px 0 0',
          zIndex: 301, padding: '0 0 env(safe-area-inset-bottom, 16px)',
          maxHeight: '92dvh', overflowY: 'auto',
          boxShadow: '0 -16px 64px rgba(26,43,76,0.2)',
          animation: 'slideUp 0.25s cubic-bezier(.32,1,.23,1)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: '#e2e8f0' }} />
        </div>

        <div style={{ padding: '8px 24px 32px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#64748b', marginBottom: 4 }}>
                Nova postagem
              </p>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1.2 }}>
                Compartilhe um trabalho concluído
              </h2>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: '#f1f5f9', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#64748b',
              }}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          {/* Photo upload */}
          <div style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', height: imagePreview ? 'auto' : 140,
                borderRadius: 20, border: '2px dashed #e2e8f0',
                background: '#f8fafc', cursor: 'pointer', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: imagePreview ? 'flex-start' : 'center',
                gap: 8, padding: imagePreview ? 0 : 24, transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Prévia"
                  style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 18 }}
                />
              ) : (
                <>
                  <span style={{ fontSize: 32 }}>📷</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>
                    Adicionar foto do trabalho
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG ou WebP · máx 5 MB</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} style={{ display: 'none' }} />
            {errors.image && <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>{errors.image}</p>}
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImagePreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ marginTop: 8, fontSize: 12, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Remover foto
              </button>
            )}
          </div>

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 6, letterSpacing: '0.05em' }}>
              TÍTULO DO TRABALHO *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: '' })); }}
              placeholder="Ex.: Reforma de banheiro completa"
              maxLength={80}
              style={{
                width: '100%', borderRadius: 14, border: `1.5px solid ${errors.title ? '#ef4444' : '#e2e8f0'}`,
                padding: '12px 16px', fontSize: 14, color: 'var(--color-navy)',
                outline: 'none', boxSizing: 'border-box', background: '#f8fafc', fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,217,0,0.15)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.title ? '#ef4444' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {errors.title && <p style={{ marginTop: 5, fontSize: 12, color: '#ef4444' }}>{errors.title}</p>}
          </div>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 8, letterSpacing: '0.05em' }}>
              CATEGORIA *
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); setErrors((p) => ({ ...p, category: '' })); }}
                  style={{
                    padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
                    background: category === cat ? 'var(--color-primary)' : '#f1f5f9',
                    color: category === cat ? 'var(--color-navy)' : '#64748b',
                    boxShadow: category === cat ? '0 2px 8px rgba(255,217,0,0.35)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p style={{ marginTop: 6, fontSize: 12, color: '#ef4444' }}>{errors.category}</p>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--color-navy)', marginBottom: 6, letterSpacing: '0.05em' }}>
              DESCRIÇÃO DO TRABALHO *
            </label>
            <textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
              placeholder="Descreva o que foi feito, materiais usados, tempo de execução, etc."
              maxLength={400}
              rows={4}
              style={{
                width: '100%', borderRadius: 14, border: `1.5px solid ${errors.description ? '#ef4444' : '#e2e8f0'}`,
                padding: '12px 16px', fontSize: 14, color: 'var(--color-navy)', resize: 'none',
                outline: 'none', boxSizing: 'border-box', background: '#f8fafc', fontFamily: 'inherit', lineHeight: 1.6,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,217,0,0.15)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = errors.description ? '#ef4444' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              {errors.description
                ? <p style={{ fontSize: 12, color: '#ef4444' }}>{errors.description}</p>
                : <span />}
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{description.length}/400</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%', padding: '16px', borderRadius: 20, border: 'none',
              background: submitting ? '#fce967' : 'var(--color-primary)',
              color: 'var(--color-navy)', fontWeight: 800, fontSize: 15,
              cursor: submitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(255,217,0,0.4)',
              transition: 'opacity 0.15s, transform 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}
            onMouseDown={(e) => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            {submitting ? (
              <>
                <span style={{ display: 'inline-block', width: 16, height: 16, border: '2.5px solid var(--color-navy)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                Publicando…
              </>
            ) : (
              '✅ Publicar trabalho'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(60px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────
const WorkPostCard = ({ post }: { post: WorkPost }) => (
  <div style={{
    borderRadius: 24, background: '#fff', border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,43,76,0.07)',
    transition: 'transform 0.18s, box-shadow 0.18s',
  }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(26,43,76,0.13)'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(26,43,76,0.07)'; }}
  >
    {post.imagePreview && (
      <img src={post.imagePreview} alt={post.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
    )}
    <div style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: 'var(--color-primary)', color: 'var(--color-navy)', borderRadius: 999,
          padding: '3px 10px',
        }}>
          {post.category}
        </span>
        <span style={{ fontSize: 11, color: '#94a3b8' }}>{post.createdAt}</span>
      </div>
      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-navy)', marginBottom: 6 }}>{post.title}</p>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{post.description}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const ProfessionalHomePage = () => {
  const userName = getUserName();
  const [modalOpen, setModalOpen] = useState(false);
  const [posts, setPosts] = useState<WorkPost[]>([]);
  const [successToast, setSuccessToast] = useState('');

  const handlePublish = (data: Omit<WorkPost, 'id' | 'createdAt'>) => {
    const newPost: WorkPost = {
      ...data,
      id: `post_${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setPosts((prev) => [newPost, ...prev]);
    setSuccessToast('Trabalho publicado com sucesso! 🎉');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant="professional" onCenterAction={() => setModalOpen(true)} />

      <NewPostModal open={modalOpen} onClose={() => setModalOpen(false)} onPublish={handlePublish} />

      {/* Success toast */}
      {successToast && (
        <div style={{
          position: 'fixed', bottom: 96, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(26,43,76,0.95)', color: '#fff', padding: '10px 24px',
          borderRadius: 999, fontSize: 13, fontWeight: 600, zIndex: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {successToast}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dashboard do prestador</p>
              <h1 className="text-3xl font-bold tracking-tight">Boas-vindas, {userName}</h1>
              <p className="max-w-2xl text-sm text-slate-600">Veja novas oportunidades de propostas e acompanhe seu desempenho.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--color-primary)', border: 'none', borderRadius: 20,
                padding: '12px 24px', fontWeight: 700, fontSize: 14, color: 'var(--color-navy)',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,217,0,0.35)',
                transition: 'transform 0.15s', fontFamily: 'inherit',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ''; }}
            >
              ＋ Publicar trabalho concluído
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">

            {/* Trabalhos publicados */}
            {posts.length > 0 && (
              <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Meus trabalhos publicados</p>
                    <p className="mt-1 text-sm text-slate-600">{posts.length} {posts.length === 1 ? 'postagem' : 'postagens'} no seu portfólio.</p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'var(--color-primary)', color: 'var(--color-navy)', borderRadius: 999, padding: '4px 12px',
                  }}>
                    {posts.length} novo{posts.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                  {posts.map((post) => <WorkPostCard key={post.id} post={post} />)}
                </div>
              </div>
            )}

            {/* Propostas */}
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Novas oportunidades</p>
                  <p className="mt-2 text-sm text-slate-600">Propostas recentes enviadas por clientes na sua área.</p>
                </div>
                <Badge variant="default" label={`${proposalCards.length} não lidas`} />
              </div>

              <div className="mt-6 space-y-4">
                {proposalCards.map((proposal) => (
                  <div key={proposal.id} className="rounded-3xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <Avatar name={proposal.client} size="sm" />
                          <div>
                            <p className="font-semibold text-[var(--color-navy)]">{proposal.client}</p>
                            <p className="text-sm text-slate-500">{proposal.service}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <p className="text-sm text-slate-500">Orçamento</p>
                        <p className="text-lg font-semibold text-[var(--color-navy)]">{proposal.value}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Badge variant={proposal.badgeVariant} label={proposal.statusLabel} />
                      <Link to={`/prestador/proposta/${proposal.id}`} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clientes próximos */}
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Clientes próximos</p>
              <p className="mt-2 text-sm text-slate-600">Clientes que solicitaram serviços na sua categoria.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="font-semibold text-[var(--color-navy)]">Lucas Oliveira</p>
                  <p className="mt-2 text-sm text-slate-700">Precisa de uma reforma de cozinha em 3 dias. Local: Zona Sul.</p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="font-semibold text-[var(--color-navy)]">Camila Santos</p>
                  <p className="mt-2 text-sm text-slate-700">Procura chamado para instalação elétrica residencial.</p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Desempenho</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Rendimento semanal</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">R$ 4.250</p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Serviços</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">
                    {12 + posts.length}
                  </p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Satisfação</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">85%</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Ações rápidas</p>
              <div className="mt-5 grid gap-3">
                <Link to="/prestador/perfil">
                  <Button fullWidth variant="secondary">Editar perfil</Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 16, border: 'none',
                    background: 'var(--color-primary)', color: 'var(--color-navy)',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(255,217,0,0.3)',
                  }}
                >
                  ＋ Novo trabalho concluído
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalHomePage;
