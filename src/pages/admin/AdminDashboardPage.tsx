import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import categories from '../../constants/categories';

const summaryCards = [
  { label: 'Usuários totais', value: '—' },
  { label: 'Profissionais ativos', value: '—' },
  { label: 'Serviços realizados', value: '—' },
  { label: 'Receita estimada', value: 'Dados de demonstração' },
];

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Painel administrativo</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Visão geral do sistema</h1>
              <p className="mt-2 text-sm text-slate-500">Dados reais do Firestore em integração. Valores "—" indicam métrica ainda não conectada.</p>
            </div>
            <Button variant="primary">Criar usuário</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-[var(--color-navy)]">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Usuários recentes</p>
                <Button variant="secondary">Ver todos</Button>
              </div>
              <div className="mt-6 text-sm text-slate-500">Sem dados reais conectados ainda (Exemplo).</div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Denúncias pendentes</p>
                <Badge variant="default" label="0" />
              </div>
              <div className="mt-6 text-sm text-slate-500">Sem denúncias (dados reais não disponíveis).</div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Gerenciamento de categorias</p>
              <div className="mt-6 space-y-3">
                {categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-3xl bg-[var(--color-bg-light)] px-4 py-3">
                    <span className="text-sm font-medium text-[var(--color-navy)]">{category.nome}</span>
                    <Button variant="secondary">Desativar</Button>
                  </div>
                ))}
              </div>
              <Button fullWidth variant="primary" className="mt-6">Adicionar categoria</Button>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Busca de perfis</p>
              <input
                type="search"
                placeholder="Nome, e-mail ou CPF"
                className="mt-4 w-full rounded-3xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
