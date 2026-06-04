import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';

const portfolioItems = [
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80',
];

const reviews = [
  {
    id: 'rev-001',
    name: 'Mariana Costa',
    text: 'Excelente profissional: rápido, educado e deixou tudo limpo após o serviço. Recomendo muito!',
    rating: 5,
    date: 'Mar 2026',
  },
  {
    id: 'rev-002',
    name: 'Claudio Ribeiro',
    text: 'Fez a instalação do encanamento com cuidado e explicou todas as etapas. Trabalho de qualidade.',
    rating: 4,
    date: 'Fev 2026',
  },
];

const ProfessionalProfilePage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="overflow-hidden rounded-[32px] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="relative h-72 overflow-hidden sm:h-96">
                <img
                  src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                  alt="Foto de trabalho do profissional"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6 text-white">
                  <div className="flex flex-wrap items-center gap-4">
                    <Avatar
                      src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
                      name="Carlos Mendes"
                      size="lg"
                      className="border-4 border-white"
                    />
                    <div className="space-y-2">
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-200">Pedreiro profissional</p>
                      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Carlos Mendes</h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100">
                        <span>12 anos de experiência</span>
                        <span>•</span>
                        <span>Atende São Paulo, SP</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute left-4 top-4 rounded-3xl bg-slate-950/80 px-4 py-2 text-sm font-semibold text-white">
                  ★ 4.9
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Sobre</p>
                    <p className="mt-3 text-base leading-7 text-slate-700">
                      Pedreiro experiente em reformas residenciais e comerciais. Especialista em alvenaria, revestimentos, pequenos reparos e instalações hidráulicas básicas.
                    </p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5 text-center">
                    <p className="text-sm text-slate-500">Média</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--color-navy)]">4.9</p>
                    <p className="text-sm text-slate-600">(127 avaliações)</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Serviços realizados</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">203</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Valor diário</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">R$ 240–380</p>
                  </div>
                  <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <p className="text-sm text-slate-500">Atuação</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-navy)]">Reforma geral</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Portfólio</p>
                  <p className="mt-2 text-base text-slate-600">Veja alguns trabalhos recentes realizados pelo Carlos.</p>
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
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-[var(--color-navy)]">{review.name}</p>
                        <p className="text-sm text-slate-500">{review.date}</p>
                      </div>
                      <StarRating value={review.rating} readOnly size="sm" />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{review.text}</p>
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
                    <span className="font-semibold text-[var(--color-navy)]">(11) 98888-0000</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Atendimento</span>
                    <span className="font-semibold text-[var(--color-navy)]">Seg–Sab • 08h–18h</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Link to="/proposta/pro-001">
                    <Button variant="primary" className="w-full">
                      Enviar proposta
                    </Button>
                  </Link>
                  <a href="https://wa.me/5511988880000" target="_blank" rel="noreferrer">
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
              <p className="mt-3 rounded-3xl bg-[var(--color-bg-light)] px-4 py-3 text-sm font-semibold text-[var(--color-navy)]">Reformas e pequenos reparos</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalProfilePage;
