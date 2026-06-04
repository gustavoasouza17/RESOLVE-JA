import { Link } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';

const proposals = [
  {
    id: 'proposal-001',
    client: 'Mariana Costa',
    service: 'Reforma de banheiro',
    value: 'R$ 1.200',
    status: 'Nova',
  },
  {
    id: 'proposal-002',
    client: 'Felipe Santos',
    service: 'Conserto elétrico',
    value: 'R$ 450',
    status: 'Pendente',
  },
];

const ProfessionalHomePage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Dashboard do prestador</p>
              <h1 className="text-3xl font-bold tracking-tight">Boas-vindas, Carlos</h1>
              <p className="max-w-2xl text-sm text-slate-600">Veja novas oportunidades de propostas e acompanhe seu desempenho.</p>
            </div>
            <Button variant="primary">Publicar novo serviço</Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Novas oportunidades</p>
                  <p className="mt-2 text-sm text-slate-600">Propostas recentes enviadas por clientes na sua área.</p>
                </div>
                <Badge variant="primary">2 não lidas</Badge>
              </div>

              <div className="mt-6 space-y-4">
                {proposals.map((proposal) => (
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
                      <Badge variant={proposal.status === 'Nova' ? 'success' : 'default'} label={proposal.status} />
                      <Link to={`/prestador/proposta/${proposal.id}`} className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
                        Ver detalhes →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                  <p className="mt-2 text-sm text-slate-700">Procura chama para instalação elétrica residencial.</p>
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
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-navy)]">12</p>
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
                <Button fullWidth variant="primary">Ver propostas</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalHomePage;
