import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';

const users = [
  { id: 'u1', name: 'Mariana Costa', profile: 'Cliente', status: 'Ativo' },
  { id: 'u2', name: 'Carlos Mendes', profile: 'Prestador', status: 'Ativo' },
  { id: 'u3', name: 'Felipe Santos', profile: 'Cliente', status: 'Suspenso' },
];

const reports = [
  { id: 'r1', reporter: 'Mariana', reported: 'Carlos', reason: 'Perfil falso', date: '01 jun 2026' },
  { id: 'r2', reporter: 'Ana', reported: 'Felipe', reason: 'Serviço não entregue', date: '28 mai 2026' },
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
            </div>
            <Button variant="primary">Criar usuário</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Usuários totais</p>
                <p className="mt-4 text-3xl font-semibold text-[var(--color-navy)]">1.248</p>
              </div>
              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Profissionais ativos</p>
                <p className="mt-4 text-3xl font-semibold text-[var(--color-navy)]">489</p>
              </div>
              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Serviços realizados</p>
                <p className="mt-4 text-3xl font-semibold text-[var(--color-navy)]">12.530</p>
              </div>
              <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Receita estimada</p>
                <p className="mt-4 text-3xl font-semibold text-[var(--color-navy)]">R$ 1.280.000</p>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Usuários recentes</p>
                <Button variant="secondary">Ver todos</Button>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-4 py-3">Nome</th>
                      <th className="px-4 py-3">Perfil</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-4 text-slate-700">{user.name}</td>
                        <td className="px-4 py-4 text-slate-600">{user.profile}</td>
                        <td className="px-4 py-4 text-slate-600">{user.status}</td>
                        <td className="px-4 py-4">
                          <Button variant="secondary">Ver perfil</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Denúncias pendentes</p>
                <Badge variant="primary">{reports.length}</Badge>
              </div>
              <div className="mt-6 space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-3xl bg-[var(--color-bg-light)] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[var(--color-navy)]">{report.reason}</p>
                        <p className="text-sm text-slate-600">Denunciante: {report.reporter}</p>
                      </div>
                      <span className="text-sm text-slate-500">{report.date}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">Denunciado: {report.reported}</p>
                    <div className="mt-4 flex gap-3">
                      <Button variant="primary">Ver perfil</Button>
                      <Button variant="secondary">Marcar como lido</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Gerenciamento de categorias</p>
              <div className="mt-6 space-y-3">
                {['Pedreiro', 'Encanador', 'Eletricista'].map((category) => (
                  <div key={category} className="flex items-center justify-between rounded-3xl bg-[var(--color-bg-light)] px-4 py-3">
                    <span className="text-sm font-medium text-[var(--color-navy)]">{category}</span>
                    <Button variant="secondary" size="sm">Desativar</Button>
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
