import { useMemo, useState } from 'react';
import Badge from '../../components/atoms/Badge';
import Button from '../../components/atoms/Button';
import Badge from '../../components/atoms/Badge';
import categories from '../../constants/categories';
import mockProfessionals from '../../constants/mockProfessionals';
import mockProposals from '../../constants/mockProposals';

const summaryCards = [
  { label: 'Usuários totais', value: '1.248' },
  { label: 'Profissionais ativos', value: '489' },
  { label: 'Serviços realizados', value: '12.530' },
  { label: 'Receita estimada', value: 'R$ 1.280.000' },
];

const users = mockProfessionals.slice(0, 3).map((professional) => ({
  id: professional.uid,
  name: professional.nome,
  profile: 'Prestador',
  status: professional.status === 'ativo' ? 'Ativo' : 'Suspenso',
}));

const reports = mockProposals.slice(0, 2).map((proposal, index) => ({
  id: `r${index + 1}`,
  reporter: proposal.clienteId,
  reported: proposal.prestadorId,
  reason: index === 0 ? 'Serviço não entregue' : 'Perfil falso',
  date: index === 0 ? '01 jun 2026' : '28 mai 2026',
}));

const AdminDashboardPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Alertas e pontos de atenção
  const [alerts, setAlerts] = useState<AlertPoint[]>(initialAlertPoints);
  const [showResolvedAlerts, setShowResolvedAlerts] = useState(false);

  // Registro de ocorrências
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>(initialOccurrences);
  const [occSearch, setOccSearch] = useState('');
  const [occStatusFilter, setOccStatusFilter] = useState<'todos' | OccurrenceStatus>('todos');
  const [occSeverityFilter, setOccSeverityFilter] = useState<'todas' | OccurrenceSeverity>('todas');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Usuários
  const [users, setUsers] = useState<AdminUser[]>(initialAdminUsers);
  const [userSearch, setUserSearch] = useState('');
  const [userProfileFilter, setUserProfileFilter] = useState<'Todos' | 'Prestador' | 'Cliente' | 'Suspenso'>('Todos');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Categorias
  const [categoryList, setCategoryList] = useState<CategoryItem[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Modais
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [newOccTitle, setNewOccTitle] = useState('');
  const [newOccType, setNewOccType] = useState<OccurrenceType>('Serviço não entregue');
  const [newOccSeverity, setNewOccSeverity] = useState<OccurrenceSeverity>('media');
  const [newOccInvolved, setNewOccInvolved] = useState('');
  const [newOccInvolvedRole, setNewOccInvolvedRole] = useState<'Prestador' | 'Cliente'>('Prestador');
  const [newOccReporter, setNewOccReporter] = useState('');
  const [newOccRegion, setNewOccRegion] = useState('');
  const [newOccDescription, setNewOccDescription] = useState('');

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserProfile, setNewUserProfile] = useState<'Prestador' | 'Cliente'>('Prestador');
  const [newUserArea, setNewUserArea] = useState('');

  const activeAlertsCount = useMemo(() => alerts.filter((a) => !a.resolvido).length, [alerts]);
  const openOccurrencesCount = useMemo(
    () => occurrences.filter((o) => o.status !== 'resolvido').length,
    [occurrences],
  );

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => (showResolvedAlerts ? true : !a.resolvido)),
    [alerts, showResolvedAlerts],
  );

  const filteredOccurrences = useMemo(() => {
    const q = occSearch.trim().toLowerCase();
    return occurrences.filter((occ) => {
      const matchesStatus = occStatusFilter === 'todos' || occ.status === occStatusFilter;
      const matchesSeverity = occSeverityFilter === 'todas' || occ.severidade === occSeverityFilter;
      const matchesQuery =
        !q ||
        occ.titulo.toLowerCase().includes(q) ||
        occ.protocolo.toLowerCase().includes(q) ||
        occ.envolvido.toLowerCase().includes(q) ||
        occ.regiao.toLowerCase().includes(q);
      return matchesStatus && matchesSeverity && matchesQuery;
    });
  }, [occurrences, occSearch, occStatusFilter, occSeverityFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesFilter =
        userProfileFilter === 'Todos' ||
        (userProfileFilter === 'Suspenso' ? u.status === 'Suspenso' : u.profile === userProfileFilter);
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.categoryOrNeighborhood.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [users, userSearch, userProfileFilter]);

  const summaryCards = useMemo(() => {
    const activePros = 489 + users.filter((u) => u.profile === 'Prestador' && u.status === 'Ativo').length - 3;
    const totalUsers = 1248 + (users.length - initialAdminUsers.length);
    return [
      {
        label: 'Usuários totais',
        value: totalUsers.toLocaleString('pt-BR'),
        delta: '+12,4%',
        hint: 'vs. mês anterior',
      },
      {
        label: 'Profissionais ativos',
        value: activePros.toLocaleString('pt-BR'),
        delta: '+6,2%',
        hint: `${categoryList.filter((c) => c.ativa).length} categorias ativas`,
      },
      {
        label: 'Serviços realizados',
        value: '12.530',
        delta: '+16,8%',
        hint: '91% taxa de conclusão',
      },
      {
        label: 'Receita estimada',
        value: 'R$ 1.280.000',
        delta: '+19,5%',
        hint: 'Ticket médio R$ 342',
      },
    ];
  }, [users, categoryList]);

  const toggleAlertResolved = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolvido: !a.resolvido } : a)));
  };

  const updateOccurrenceStatus = (id: string, status: OccurrenceStatus) => {
    setOccurrences((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const saveOccurrenceNote = (id: string) => {
    setOccurrences((prev) =>
      prev.map((o) => (o.id === id ? { ...o, notaInterna: noteDraft.trim() || undefined } : o)),
    );
    setEditingNoteId(null);
    setNoteDraft('');
  };

  const handleCreateOccurrence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOccTitle.trim() || !newOccInvolved.trim()) return;

    const nextNum = 2049 + occurrences.length - initialOccurrences.length;
    const newRecord: OccurrenceRecord = {
      id: `occ-${Date.now()}`,
      protocolo: `OC-${nextNum}`,
      titulo: newOccTitle.trim(),
      tipo: newOccType,
      severidade: newOccSeverity,
      status: 'aberto',
      envolvido: newOccInvolved.trim(),
      perfilEnvolvido: newOccInvolvedRole,
      relator: newOccReporter.trim() || 'Registro manual (Admin)',
      regiao: newOccRegion.trim() || 'São Paulo, SP',
      data: 'Agora mesmo',
      descricao: newOccDescription.trim() || 'Ocorrência registrada manualmente pelo painel administrativo.',
    };

    setOccurrences((prev) => [newRecord, ...prev]);
    setNewOccTitle('');
    setNewOccInvolved('');
    setNewOccReporter('');
    setNewOccRegion('');
    setNewOccDescription('');
    setIsOccurrenceModalOpen(false);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        const nextStatus = u.status === 'Suspenso' ? 'Ativo' : 'Suspenso';
        return { ...u, status: nextStatus };
      }),
    );
    setSelectedUser((prev) =>
      prev && prev.id === id
        ? { ...prev, status: prev.status === 'Suspenso' ? 'Ativo' : 'Suspenso' }
        : prev,
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      profile: newUserProfile,
      categoryOrNeighborhood: newUserArea.trim() || (newUserProfile === 'Prestador' ? 'Geral' : 'Centro'),
      status: 'Ativo',
      rating: 5.0,
      servicesCount: 0,
      joinedAt: 'Hoje',
    };

    setUsers((prev) => [created, ...prev]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserArea('');
    setIsUserModalOpen(false);
  };

  const toggleCategoryActive = (id: string) => {
    setCategoryList((prev) => prev.map((c) => (c.id === id ? { ...c, ativa: !c.ativa } : c)));
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      nome: newCategoryName.trim(),
      icone: 'wrench',
      ativa: true,
    };
    setCategoryList((prev) => [...prev, newCat]);
    setNewCategoryName('');
    setShowCategoryForm(false);
  };

  const handleExportCsv = () => {
    const header = 'Protocolo,Titulo,Tipo,Severidade,Status,Envolvido,Regiao,Data\n';
    const rows = occurrences
      .map((o) =>
        [o.protocolo, o.titulo, o.tipo, o.severidade, o.status, o.envolvido, o.regiao, o.data]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ocorrencias-resolve-ja.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] text-[var(--color-navy)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 rounded-[32px] bg-white p-6 shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Painel administrativo
                </p>
                <Badge
                  variant={activeAlertsCount > 0 ? 'danger' : 'success'}
                  label={`${activeAlertsCount} alertas ativos`}
                />
                <Badge
                  variant={openOccurrencesCount > 0 ? 'warning' : 'success'}
                  label={`${openOccurrencesCount} ocorrências em aberto`}
                />
              </div>
              <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
                Central de Operações & Monitoramento
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Acompanhe indicadores em tempo real, pontos de atenção, ocorrências e moderação de usuários.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCsv}
                className="rounded-[12px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-slate-50"
              >
                Exportar CSV
              </button>
              <Button variant="secondary" onClick={() => setIsOccurrenceModalOpen(true)}>
                + Registrar ocorrência
              </Button>
              <Button variant="primary" onClick={() => setIsUserModalOpen(true)}>
                + Criar usuário
              </Button>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {card.label}
                </p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {card.delta}
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-navy)]">
                {card.value}
              </p>
              <p className="mt-1.5 text-xs text-slate-500">{card.hint}</p>
            </div>
          ))}
        </section>

        {/* Pontos de Alerta e Atenção */}
        <section className="mb-8 rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Painel administrativo</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight">Visão geral do sistema</h1>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={showResolvedAlerts}
                onChange={(e) => setShowResolvedAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[var(--color-navy)]"
              />
              Mostrar resolvidos ({alerts.filter((a) => a.resolvido).length})
            </label>
          </div>

          {visibleAlerts.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-emerald-50 p-6 text-center text-sm font-medium text-emerald-800">
              Nenhum ponto de alerta pendente no momento. Operação operando dentro dos parâmetros normais.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleAlerts.map((alert) => {
                const cfg = alertSeverityConfig[alert.severidade];
                return (
                  <div
                    key={alert.id}
                    className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                      alert.resolvido
                        ? 'border-slate-200 bg-slate-50/60 opacity-70'
                        : `${cfg.borderClass} ${cfg.bgClass}`
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={alert.resolvido ? 'success' : cfg.badgeVariant}
                            label={alert.resolvido ? 'Resolvido' : cfg.label}
                          />
                          <span className="text-xs font-semibold text-slate-500">{alert.area}</span>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[var(--color-navy)] ring-1 ring-slate-200">
                          {alert.metrica}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-[var(--color-navy)]">
                        {alert.titulo}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {alert.descricao}
                      </p>
                      <p className="mt-2.5 text-xs font-medium text-slate-500">
                        Ação sugerida: <span className="text-slate-700">{alert.acaoSugerida}</span>
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3">
                      <span className="text-xs text-slate-500">Detectado: {alert.detectadoEm}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAlertResolved(alert.id)}
                          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-navy)] ring-1 ring-slate-200 transition hover:bg-slate-100"
                        >
                          {alert.resolvido ? 'Reabrir alerta' : 'Marcar como tratado'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Gráficos */}
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <RevenueServicesChart range={timeRange} onRangeChange={setTimeRange} />
          <ProposalStatusDonut />
        </section>

        <section className="mb-8">
          <CategoryDemandChart />
        </section>

        {/* Main Grid: Ocorrências + Usuários à esquerda | Categorias + Resumo rápido à direita */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
          <section className="space-y-8">
            {/* Registro de Ocorrências */}
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Auditoria e incidentes
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--color-navy)]">
                    Registro de ocorrências
                  </h2>
                </div>
                <Button variant="primary" onClick={() => setIsOccurrenceModalOpen(true)}>
                  Nova ocorrência
                </Button>
              </div>

              {/* Filtros de ocorrências */}
              <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <input
                  type="search"
                  value={occSearch}
                  onChange={(e) => setOccSearch(e.target.value)}
                  placeholder="Buscar por protocolo, envolvido, título ou região..."
                  className="w-full rounded-2xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[var(--color-navy)] lg:max-w-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {(['todos', 'aberto', 'em_analise', 'resolvido'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setOccStatusFilter(status)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        occStatusFilter === status
                          ? 'bg-[var(--color-navy)] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'todos'
                        ? 'Todos status'
                        : status === 'aberto'
                          ? 'Abertos'
                          : status === 'em_analise'
                            ? 'Em análise'
                            : 'Resolvidos'}
                    </button>
                  ))}

                  <select
                    aria-label="Filtrar por severidade"
                    value={occSeverityFilter}
                    onChange={(e) => setOccSeverityFilter(e.target.value as 'todas' | OccurrenceSeverity)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="todas">Todas severidades</option>
                    <option value="alta">Severidade Alta</option>
                    <option value="media">Severidade Média</option>
                    <option value="baixa">Severidade Baixa</option>
                  </select>
                </div>
              </div>

              {/* Lista de ocorrências */}
              <div className="mt-6 space-y-4">
                {filteredOccurrences.length === 0 ? (
                  <div className="rounded-2xl bg-[var(--color-bg-light)] p-6 text-center text-sm text-slate-500">
                    Nenhuma ocorrência encontrada com os filtros atuais.
                  </div>
                ) : (
                  filteredOccurrences.map((occ) => {
                    const sev = occurrenceSeverityBadge[occ.severidade];
                    const st = occurrenceStatusBadge[occ.status];
                    const isEditingNote = editingNoteId === occ.id;

                    return (
                      <div
                        key={occ.id}
                        className="rounded-2xl border border-slate-200 bg-[var(--color-bg-light)]/70 p-5 transition hover:border-slate-300"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs font-bold text-[var(--color-navy)] ring-1 ring-slate-200">
                                #{occ.protocolo}
                              </span>
                              <Badge variant={sev.variant} label={`Severidade ${sev.label}`} />
                              <Badge variant={st.variant} label={st.label} />
                              <span className="text-xs font-medium text-slate-500">{occ.tipo}</span>
                            </div>
                            <h3 className="pt-1 text-base font-bold text-[var(--color-navy)]">
                              {occ.titulo}
                            </h3>
                          </div>
                          <span className="text-xs text-slate-500">{occ.data}</span>
                        </div>

                        <p className="mt-2 text-sm text-slate-700">{occ.descricao}</p>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                          <span>
                            Envolvido:{' '}
                            <strong className="text-[var(--color-navy)]">
                              {occ.envolvido} ({occ.perfilEnvolvido})
                            </strong>
                          </span>
                          <span>
                            Relator: <strong className="text-slate-700">{occ.relator}</strong>
                          </span>
                          <span>
                            Região: <strong className="text-slate-700">{occ.regiao}</strong>
                          </span>
                        </div>

                        {occ.notaInterna && !isEditingNote && (
                          <div className="mt-3 rounded-xl bg-white px-3.5 py-2.5 text-xs text-slate-600 ring-1 ring-slate-200">
                            <span className="font-semibold text-[var(--color-navy)]">Nota interna: </span>
                            {occ.notaInterna}
                          </div>
                        )}

                        {isEditingNote && (
                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input
                              type="text"
                              value={noteDraft}
                              onChange={(e) => setNoteDraft(e.target.value)}
                              placeholder="Escreva uma nota interna de acompanhamento..."
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[var(--color-navy)]"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => saveOccurrenceNote(occ.id)}
                                className="rounded-xl bg-[var(--color-navy)] px-3 py-2 text-xs font-semibold text-white"
                              >
                                Salvar nota
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {occ.status === 'aberto' && (
                            <button
                              type="button"
                              onClick={() => updateOccurrenceStatus(occ.id, 'em_analise')}
                              className="rounded-xl bg-[var(--color-navy)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                            >
                              Assumir análise
                            </button>
                          )}
                          {occ.status !== 'resolvido' ? (
                            <button
                              type="button"
                              onClick={() => updateOccurrenceStatus(occ.id, 'resolvido')}
                              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              Marcar como resolvido
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateOccurrenceStatus(occ.id, 'aberto')}
                              className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                            >
                              Reabrir
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(occ.id);
                              setNoteDraft(occ.notaInterna ?? '');
                            }}
                            className="rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-navy)] ring-1 ring-slate-200 transition hover:bg-slate-100"
                          >
                            {occ.notaInterna ? 'Editar nota' : 'Adicionar nota'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Tabela de Usuários e Moderação */}
            <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Base de contas
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[var(--color-navy)]">
                    Usuários & Moderação
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['Todos', 'Prestador', 'Cliente', 'Suspenso'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setUserProfileFilter(tab)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        userProfileFilter === tab
                          ? 'bg-[var(--color-navy)] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="search"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Filtrar por nome, e-mail, categoria ou bairro..."
                  className="w-full rounded-2xl border border-slate-200 bg-[var(--color-bg-light)] px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[var(--color-navy)]"
                />
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
          </section>

            <div className="rounded-[32px] bg-white p-8 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Denúncias pendentes</p>
                <Badge variant="default" label={`${reports.length}`} />
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
                {categories.slice(0, 3).map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-3xl bg-[var(--color-bg-light)] px-4 py-3">
                    <span className="text-sm font-medium text-[var(--color-navy)]">{category.nome}</span>
                    <Button variant="secondary">Desativar</Button>
                  </div>
                </form>
              ) : (
                <Button
                  fullWidth
                  variant="primary"
                  className="mt-5"
                  onClick={() => setShowCategoryForm(true)}
                >
                  + Adicionar categoria
                </Button>
              )}
            </div>

            {/* Indicadores Rápidos de Qualidade */}
            <div className="rounded-[32px] bg-[var(--color-navy)] p-6 text-white shadow-sm sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                SLA & Qualidade
              </p>
              <h2 className="mt-1 text-lg font-bold">Resumo operacional</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">Tempo médio 1ª resposta</span>
                  <span className="font-bold text-amber-300">18 min</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">NPS da plataforma</span>
                  <span className="font-bold text-emerald-300">74 pts</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-slate-300">Taxa de reincidência</span>
                  <span className="font-bold text-white">3,2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Cadastros em verificação</span>
                  <span className="font-bold text-amber-300">6 perfis</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Modal: Nova Ocorrência */}
      {isOccurrenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--color-navy)]">Registrar nova ocorrência</h3>
              <button
                type="button"
                onClick={() => setIsOccurrenceModalOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOccurrence} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Título da ocorrência
                </label>
                <input
                  type="text"
                  required
                  value={newOccTitle}
                  onChange={(e) => setNewOccTitle(e.target.value)}
                  placeholder="Ex.: Atraso na entrega do serviço"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Tipo
                  </label>
                  <select
                    value={newOccType}
                    onChange={(e) => setNewOccType(e.target.value as OccurrenceType)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  >
                    {occurrenceTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Severidade
                  </label>
                  <select
                    value={newOccSeverity}
                    onChange={(e) => setNewOccSeverity(e.target.value as OccurrenceSeverity)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  >
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Envolvido
                  </label>
                  <input
                    type="text"
                    required
                    value={newOccInvolved}
                    onChange={(e) => setNewOccInvolved(e.target.value)}
                    placeholder="Nome do usuário"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Perfil envolvido
                  </label>
                  <select
                    value={newOccInvolvedRole}
                    onChange={(e) => setNewOccInvolvedRole(e.target.value as 'Prestador' | 'Cliente')}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  >
                    <option value="Prestador">Prestador</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Relator
                  </label>
                  <input
                    type="text"
                    value={newOccReporter}
                    onChange={(e) => setNewOccReporter(e.target.value)}
                    placeholder="Quem reportou"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Região
                  </label>
                  <input
                    type="text"
                    value={newOccRegion}
                    onChange={(e) => setNewOccRegion(e.target.value)}
                    placeholder="Ex.: Pinheiros, SP"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Descrição
                </label>
                <textarea
                  rows={3}
                  value={newOccDescription}
                  onChange={(e) => setNewOccDescription(e.target.value)}
                  placeholder="Detalhes do ocorrido..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsOccurrenceModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Registrar ocorrência
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Criar Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--color-navy)]">Criar novo usuário</h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Nome completo
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex.: Mariana Oliveira"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="mariana@email.com"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Perfil
                  </label>
                  <select
                    value={newUserProfile}
                    onChange={(e) => setNewUserProfile(e.target.value as 'Prestador' | 'Cliente')}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  >
                    <option value="Prestador">Prestador</option>
                    <option value="Cliente">Cliente</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {newUserProfile === 'Prestador' ? 'Categoria' : 'Bairro'}
                  </label>
                  <input
                    type="text"
                    value={newUserArea}
                    onChange={(e) => setNewUserArea(e.target.value)}
                    placeholder={newUserProfile === 'Prestador' ? 'Eletricista' : 'Moema'}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-navy)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Criar usuário
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge
                  variant={
                    selectedUser.status === 'Ativo'
                      ? 'success'
                      : selectedUser.status === 'Suspenso'
                        ? 'danger'
                        : 'warning'
                  }
                  label={selectedUser.status}
                />
                <h3 className="mt-2 text-xl font-bold text-[var(--color-navy)]">{selectedUser.name}</h3>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--color-bg-light)] p-4 text-sm">
              <div>
                <p className="text-xs text-slate-500">Perfil</p>
                <p className="font-semibold text-[var(--color-navy)]">{selectedUser.profile}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Área</p>
                <p className="font-semibold text-[var(--color-navy)]">
                  {selectedUser.categoryOrNeighborhood}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Avaliação</p>
                <p className="font-semibold text-[var(--color-navy)]">
                  {selectedUser.rating.toFixed(1)} ★
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Serviços</p>
                <p className="font-semibold text-[var(--color-navy)]">{selectedUser.servicesCount}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedUser(null)}>
                Fechar
              </Button>
              <Button
                variant={selectedUser.status === 'Suspenso' ? 'primary' : 'danger'}
                onClick={() => toggleUserStatus(selectedUser.id)}
              >
                {selectedUser.status === 'Suspenso' ? 'Reativar conta' : 'Suspender conta'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
