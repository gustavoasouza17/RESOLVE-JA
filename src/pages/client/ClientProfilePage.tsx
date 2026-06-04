import Avatar from '../../components/atoms/Avatar';
import Button from '../../components/atoms/Button';
import StarRating from '../../components/atoms/StarRating';

const history = [
  { id: 'order-001', service: 'Reforma de banheiro', status: 'Concluído', date: '25 abr 2026' },
  { id: 'order-002', service: 'Instalação elétrica', status: 'Em andamento', date: '17 mai 2026' },
  { id: 'order-003', service: 'Pintura de cozinha', status: 'Cancelado', date: '03 mai 2026' },
];

const reviews = [
  { id: 'rev-001', name: 'Carlos Mendes', rating: 5, text: 'Cliente claro e organizado. Pagou rápido após a conclusão.' },
  { id: 'rev-002', name: 'Ana Souza', rating: 4, text: 'Ótima comunicação, deixou tudo pronto para eu trabalhar.' },
];

const ClientProfilePage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-8">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Avatar name="Mariana Costa" size="lg" />
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Perfil do cliente</p>
                  <h1 className="text-3xl font-bold tracking-tight">Mariana Costa</h1>
                  <p className="text-sm text-slate-600">São Paulo, SP</p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Serviços concluídos</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">8</p>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Avaliação média</p>
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating value={4.8} readOnly size="sm" />
                    <span className="text-sm text-slate-600">4.8</span>
                  </div>
                </div>
                <div className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                  <p className="text-sm text-slate-500">Último serviço</p>
                  <p className="mt-2 text-base font-semibold text-[var(--color-navy)]">Pintura de cozinha</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Histórico de serviços</p>
                  <p className="mt-2 text-sm text-slate-600">Acompanhe suas solicitações recentes e o status de cada uma.</p>
                </div>
                <Button variant="secondary">Ver mais</Button>
              </div>

              <div className="mt-6 space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
                      <div>
                        <p className="font-semibold text-[var(--color-navy)]">{item.service}</p>
                        <p className="text-sm text-slate-600">{item.date}</p>
                      </div>
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Avaliações recebidas</p>
                <span className="text-sm text-slate-500">2 recentes</span>
              </div>
              <div className="mt-6 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-[var(--color-navy)]">{review.name}</p>
                      <StarRating value={review.rating} readOnly size="sm" />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button fullWidth variant="primary">Editar perfil</Button>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
