import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import PortfolioGrid from '../../components/molecules/PortfolioGrid';
import ReviewCard from '../../components/molecules/ReviewCard';
import mockProfessionals from '../../constants/mockProfessionals';
import mockReviews from '../../constants/mockReviews';

const ProfessionalProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSearchState = location.state as
    | { fromSearch?: boolean; category?: string; query?: string }
    | undefined;
  const professional = mockProfessionals.find((item) => item.uid === id) ?? mockProfessionals[0];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const heroImage = professional.portfolio[0] ?? professional.fotoUrl;
  const portfolioItems = professional.portfolio ?? [];
  const reviews = mockReviews.filter((review) => review.destinatarioId === professional.uid);
  const reviewItems = reviews.slice(0, 3);
  const hasWhatsApp = Boolean(professional.whatsapp?.trim());
  const availabilityDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const;

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

  const handleBackToSearch = () => {
    if (fromSearchState?.fromSearch) {
      const basePath = fromSearchState.category
        ? `/buscar/${encodeURIComponent(fromSearchState.category)}`
        : '/buscar';
      const queryString = fromSearchState.query
        ? `?q=${encodeURIComponent(fromSearchState.query)}`
        : '';

      navigate(`${basePath}${queryString}`);
      return;
    }

    navigate('/buscar');
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button type="button" variant="secondary" className="inline-flex items-center gap-2" onClick={handleBackToSearch}>
            ← Voltar para a busca
          </Button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="relative h-72 overflow-hidden sm:h-96">
                <img
                  src={heroImage}
                  alt={`Portfólio de ${professional.nome}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6 text-white">
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar
                      src={professional.fotoUrl}
                      name={professional.nome}
                      size="lg"
                      className="border-4 border-white"
                    />
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-200">{professional.categorias[0]} profissional</p>
                      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{professional.nome}</h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
                        <span>{professional.totalServicos} serviços</span>
                        <span>•</span>
                        <span>{professional.bairrosAtendimento[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-4 rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
                  ★ {professional.avaliacaoMedia}
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Sobre</p>
                    <p className="mt-3 text-base leading-7 text-slate-700">{professional.bio}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5 text-center">
                    <p className="text-sm text-slate-500">Média</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--color-navy)]">{professional.avaliacaoMedia}</p>
                    <p className="text-sm text-slate-600">({professional.totalAvaliacoes} avaliações)</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Serviços realizados</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.totalServicos}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Valor diário</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.valorDiaria}</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Atuação</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">{professional.categorias.join(', ')}</p>
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
                  const available = professional.disponibilidade[day]?.length > 0;
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
                        {available ? professional.disponibilidade[day].join(', ') : 'Indisponível'}
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
                  <p className="mt-2 text-base text-slate-600">Veja alguns trabalhos recentes realizados por {professional.nome}.</p>
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
                      author={review.autorId}
                      rating={review.estrelas}
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
                      {hasWhatsApp ? professional.whatsapp : 'Não disponível'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Atendimento</span>
                    <span className="font-semibold text-[var(--color-navy)]">Seg–Sab • 08h–18h</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Link to={`/proposta/${professional.uid}`}>
                    <Button variant="primary" className="w-full">
                      Enviar proposta
                    </Button>
                  </Link>
                  {hasWhatsApp ? (
                    <a href={`https://wa.me/${professional.whatsapp}`} target="_blank" rel="noreferrer">
                      <Button variant="secondary" className="w-full">
                        Contatar no WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <Button variant="secondary" className="w-full opacity-50" disabled>
                      WhatsApp indisponível
                    </Button>
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
              <p className="mt-3 rounded-3xl bg-[var(--color-bg-light)] px-4 py-3 text-sm font-semibold text-[var(--color-navy)]">{professional.categorias.join(', ')}</p>
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
