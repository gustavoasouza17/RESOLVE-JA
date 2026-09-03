import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import BottomNav from '../../components/organisms/BottomNav';
import PortfolioGrid from '../../components/molecules/PortfolioGrid';
import ReviewCard from '../../components/molecules/ReviewCard';
import { logout } from '../../services/auth';
import { getReviewsForUser, type ReviewWithAuthor } from '../../services/reviews';
import { subscribeToCompletedServicesCount } from '../../services/professionals';

const getAuthUser = () => {
  try {
    const raw = window.localStorage.getItem('resolveJaAuth');
    if (!raw) return null;
    return JSON.parse(raw) as {
      profile: 'cliente' | 'prestador';
      fullName: string;
      uid?: string;
      category?: string;
      city?: string;
      state?: string;
      phone?: string;
      email?: string;
    };
  } catch {
    return null;
  }
};

const ProfessionalProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const profileId = id ?? authUser?.uid;

  const [dbProfessional, setDbProfessional] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewWithAuthor[]>([]);
  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profRef = doc(db, 'professionals', profileId);
        const snap = await getDoc(profRef);
        if (snap.exists()) {
          setDbProfessional(snap.data());
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do Firestore:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!profileId) return;
      const data = await getReviewsForUser(profileId);
      setReviews(data.filter((r) => r.tipo === 'cliente_para_prestador'));
    };

    fetchProfile();
    fetchReviews();
  }, [profileId]);

  // Assina contagem em tempo real de serviços concluídos do prestador
  useEffect(() => {
    if (!profileId) return;
    const unsubscribe = subscribeToCompletedServicesCount(profileId, setCompletedCount);
    return unsubscribe;
  }, [profileId]);

  const getProfessionalData = () => {
    // Se houver dados do Firestore, usar em prioritário
    if (dbProfessional) {
      return {
        uid: profileId,
        nome: dbProfessional.nome || authUser?.fullName || 'Profissional',
        fotoUrl: dbProfessional.fotoUrl || '',
        categorias: dbProfessional.categorias || (authUser?.category ? [authUser.category] : ['Prestador']),
        bio: dbProfessional.bio || 'Perfil do prestador cadastrado.',
        totalServicos: dbProfessional.totalServicos || 0,
        totalAvaliacoes: dbProfessional.totalAvaliacoes || 0,
        avaliacaoMedia: dbProfessional.avaliacaoMedia ?? 0,
        valorDiaria: dbProfessional.valorDiaria || 'Sob consulta',
        bairrosAtendimento: dbProfessional.bairrosAtendimento || (authUser?.city ? [authUser.city] : ['Localidade']),
        disponibilidade: dbProfessional.disponibilidade || {
          segunda: [],
          terca: [],
          quarta: [],
          quinta: [],
          sexta: [],
          sabado: [],
          domingo: [],
        },
        portfolio: dbProfessional.portfolio || [],
        whatsapp: dbProfessional.whatsapp || (authUser?.phone ?? ''),
      };
    }

    // Se for proprietário (prestador visualizando seu próprio perfil), usar dados do auth
    if (authUser?.profile === 'prestador' && (!profileId || authUser?.uid === profileId)) {
      return {
        uid: authUser.uid ?? 'prestador-atual',
        nome: authUser.fullName,
        fotoUrl: '',
        categorias: authUser.category ? [authUser.category] : ['Prestador'],
        bio: 'Perfil do prestador cadastrado. Atualize seus serviços e disponibilidade.',
        totalServicos: 0,
        totalAvaliacoes: 0,
        avaliacaoMedia: 0,
        valorDiaria: 'Sob consulta',
        bairrosAtendimento: authUser.city ? [authUser.city] : ['Localidade'],
        disponibilidade: {
          segunda: [],
          terca: [],
          quarta: [],
          quinta: [],
          sexta: [],
          sabado: [],
          domingo: [],
        },
        portfolio: [],
        whatsapp: authUser.phone ?? '',
      };
    }

    return null;
    return null;
  };

  const selectedProfessional = getProfessionalData();
  const isOwner = !!selectedProfessional && authUser?.profile === 'prestador' && (!id || authUser?.uid === selectedProfessional.uid);
  const effectiveTotalServicos = completedCount ?? selectedProfessional?.totalServicos ?? 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
    window.localStorage.removeItem('resolveJaAuth');
    navigate('/');
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const getDayLabel = (day: typeof availabilityDays[number]) => {
    const labels: Record<typeof availabilityDays[number], string> = {
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
      sabado: 'Sábado',
    };
    return labels[day];
  };

  const handleReportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReportSent(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (!selectedProfessional) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
        <BottomNav variant={authUser?.profile === 'prestador' ? 'professional' : 'client'} />
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-white p-10 text-center shadow-lg ring-1 ring-slate-200">
            <h1 className="text-2xl font-bold text-[var(--color-navy)]">Profissional não encontrado</h1>
            <p className="mt-3 text-sm text-slate-600">O perfil solicitado não está disponível no momento.</p>
            <Button variant="primary" className="mt-6" onClick={() => navigate(-1)}>Voltar</Button>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = selectedProfessional.portfolio[0] ?? selectedProfessional.fotoUrl;
  const portfolioItems = selectedProfessional.portfolio ?? [];
  const reviewItems = reviews.slice(0, 3);
  const hasWhatsApp = Boolean(selectedProfessional.whatsapp?.trim());
  const availabilityDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const;

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)] pb-28">
      <BottomNav variant={authUser?.profile === 'prestador' ? 'professional' : 'client'} />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="relative h-72 overflow-hidden sm:h-96">
                <img
                  src={heroImage}
                  alt={`Portfólio de ${selectedProfessional.nome}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6 text-white">
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar
                      src={selectedProfessional.fotoUrl}
                      name={selectedProfessional.nome}
                      size="lg"
                      useLogoFallback
                      className="border-4 border-white"
                    />
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-200">{selectedProfessional.categorias[0]} profissional</p>
                      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{selectedProfessional.nome}</h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
                        <span>{effectiveTotalServicos} serviços</span>
                        <span>•</span>
                        <span>{selectedProfessional.bairrosAtendimento[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-4 rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
                  ★ {selectedProfessional.avaliacaoMedia}
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Sobre</p>
                    <p className="mt-3 text-base leading-7 text-slate-700">{selectedProfessional.bio}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5 text-center">
                    <p className="text-sm text-slate-500">Média</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--color-navy)]">{selectedProfessional.avaliacaoMedia}</p>
                    <p className="text-sm text-slate-600">({selectedProfessional.totalAvaliacoes} avaliações)</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Serviços realizados</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{effectiveTotalServicos}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Valor diário</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{selectedProfessional.valorDiaria}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Atuação</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{selectedProfessional.categorias.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Disponibilidade</p>
                <p className="text-base text-slate-600">Dias da semana com atendimento disponível.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {availabilityDays.map((day) => {
                  const available = selectedProfessional.disponibilidade[day]?.length > 0;
                  return (
                    <div
                      key={day}
                      className={`rounded-3xl border p-4 text-center ${
                        available
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-navy)]'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <p className="text-sm font-semibold">{getDayLabel(day)}</p>
                      <p className="mt-2 text-xs">
                        {available ? selectedProfessional.disponibilidade[day].join(', ') : 'Indisponível'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Portfólio</p>
                  <p className="mt-2 text-base text-slate-600">Veja alguns trabalhos recentes realizados por {selectedProfessional.nome}.</p>
                </div>
                {portfolioItems.length > 0 ? <Button variant="secondary">Ver todos</Button> : null}
              </div>

              {portfolioItems.length > 0 ? (
                <PortfolioGrid images={portfolioItems} onImageClick={setSelectedImage} />
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--color-bg-light)] p-10 text-center text-sm text-slate-600">
                  Nenhuma foto adicionada ainda.
                </div>
              )}
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliações</p>
                <p className="mt-2 text-base text-slate-600">Opiniões de clientes reais após o serviço.</p>
              </div>

              <div className="space-y-6">
                {reviewItems.length > 0 ? (
                  reviewItems.map((review) => (
                    <ReviewCard
                      key={review.id}
                      author={review.autorNome}
                      avatarUrl={review.autorFotoUrl || undefined}
                      rating={review.nota}
                      comment={review.comentario}
                      date={new Date(review.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    />
                  ))
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-[var(--color-bg-light)] p-10 text-center text-sm text-slate-600">
                    Ainda sem avaliações.
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            {isOwner && (
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
                      {effectiveTotalServicos}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Satisfação</p>
                    <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">85%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Contato</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--color-navy)]">Agende uma proposta com o prestador</p>
                </div>

                <div className="space-y-3 rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>WhatsApp</span>
                    <span className="font-semibold text-[var(--color-navy)]">
                      {hasWhatsApp ? selectedProfessional.whatsapp : 'Não disponível'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Atendimento</span>
                    <span className="font-semibold text-[var(--color-navy)]">Seg–Sab • 08h–18h</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {isOwner ? (
                    <>
                      <Link to="/prestador/perfil/editar">
                        <Button variant="primary" className="w-full">
                          Editar perfil
                        </Button>
                      </Link>
                      <Button variant="outline-danger" fullWidth onClick={handleLogout} className="gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sair da conta
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to={`/proposta/${selectedProfessional.uid}`}>
                        <Button variant="primary" className="w-full">
                          Enviar proposta
                        </Button>
                      </Link>
                      {hasWhatsApp ? (
                        <a href={`https://wa.me/${selectedProfessional.whatsapp}`} target="_blank" rel="noreferrer">
                          <Button variant="secondary" className="w-full">
                            Contatar no WhatsApp
                          </Button>
                        </a>
                      ) : (
                        <Button variant="secondary" className="w-full opacity-50" disabled>
                          WhatsApp indisponível
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dicas rápidas</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>• Disponibilidade para projetos residenciais e reformas.</li>
                <li>• Atendimento em até 24h após solicitação.</li>
                <li>• Orçamento presencial grátis na zona sul.</li>
              </ul>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Categoria</p>
              <p className="mt-3 rounded-3xl bg-[var(--color-bg-light)] px-4 py-3 text-sm font-semibold text-[var(--color-navy)]">{selectedProfessional.categorias.join(', ')}</p>
            </div>
          </aside>
        </div>
      </div>

      {selectedImage ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="relative max-h-full w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 rounded-full bg-white px-3 py-2 text-slate-700 shadow transition hover:bg-slate-100"
            >
              Fechar
            </button>
            <img src={selectedImage} alt="Imagem em destaque" className="h-[80vh] w-full object-contain bg-slate-950" />
          </div>
        </div>
      ) : null}

      {isReportOpen ? (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Denunciar perfil</p>
                <h2 className="mt-3 text-2xl font-bold text-[var(--color-navy)]">O que você quer reportar?</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsReportOpen(false)}
                className="text-sm font-semibold text-slate-500 hover:text-slate-900"
              >
                Fechar
              </button>
            </div>

            {reportSent ? (
              <div className="mt-8 rounded-[28px] bg-emerald-50 p-6 text-sm text-emerald-800 ring-1 ring-emerald-200">
                Obrigado pela denúncia. Ela foi enviada para análise.
              </div>
            ) : (
              <form className="mt-6 space-y-6" onSubmit={handleReportSubmit}>
                <label className="block text-sm font-semibold text-slate-700">
                  Motivo da denúncia
                  <textarea
                    value={reportReason}
                    onChange={(event) => setReportReason(event.target.value)}
                    placeholder="Descreva o motivo..."
                    className="mt-3 h-36 w-full resize-none rounded-[24px] border border-slate-200 bg-[var(--color-bg-light)] px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="rounded-[24px] border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!reportReason.trim()}
                    className="rounded-[24px] bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-[var(--color-navy)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Enviar denúncia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfessionalProfilePage;
