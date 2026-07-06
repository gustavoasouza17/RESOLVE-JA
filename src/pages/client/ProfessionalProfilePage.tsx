import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';
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

  const portfolioItems = professional.portfolio;
  const reviews = mockReviews.filter((review) => review.destinatarioId === professional.uid).slice(0, 3);
  const reviewItems = reviews.length ? reviews : mockReviews.slice(0, 2);

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
                  src={portfolioItems[0]}
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Portfólio</p>
                  <p className="mt-2 text-base text-slate-600">Veja alguns trabalhos recentes realizados por {professional.nome}.</p>
                </div>
                <Button variant="secondary">Ver todos</Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {portfolioItems.map((src) => (
                  <div key={src} className="overflow-hidden rounded-[28px] bg-slate-100 shadow-sm">
                    <img src={src} alt="Portfolio do profissional" className="h-40 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliações</p>
                <p className="mt-2 text-base text-slate-600">Opiniões de clientes reais após o serviço.</p>
              </div>

              <div className="space-y-6">
                {reviewItems.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-navy)]">{review.autorId}</p>
                        <p className="text-sm text-slate-500">{new Date(review.criadoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}</p>
                      </div>
                      <StarRating value={review.estrelas} readOnly size="sm" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{review.comentario}</p>
                  </div>
                ))}
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
                    <span className="font-semibold text-[var(--color-navy)]">{professional.whatsapp}</span>
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
                  <a href={`https://wa.me/${professional.whatsapp}`} target="_blank" rel="noreferrer">
                    <Button variant="secondary" className="w-full">
                      Contatar no WhatsApp
                    </Button>
                  </a>
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
    </div>
  );
};

export default ProfessionalProfilePage;
