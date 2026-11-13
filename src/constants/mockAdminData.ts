import mockProfessionals from './mockProfessionals';

export type TimeRange = '7d' | '30d' | '6m';

export type ChartPoint = {
  label: string;
  servicos: number;
  receita: number;
  novosUsuarios: number;
};

export type AlertSeverity = 'critico' | 'atencao' | 'info';

export type AlertPoint = {
  id: string;
  titulo: string;
  descricao: string;
  severidade: AlertSeverity;
  area: string;
  metrica: string;
  detectadoEm: string;
  resolvido: boolean;
  acaoSugerida: string;
};

export type OccurrenceSeverity = 'alta' | 'media' | 'baixa';
export type OccurrenceStatus = 'aberto' | 'em_analise' | 'resolvido';
export type OccurrenceType =
  | 'Serviço não entregue'
  | 'Atraso recorrente'
  | 'Divergência de valor'
  | 'Perfil suspeito'
  | 'Qualidade abaixo do padrão'
  | 'Comportamento inadequado';

export type OccurrenceRecord = {
  id: string;
  protocolo: string;
  titulo: string;
  tipo: OccurrenceType;
  severidade: OccurrenceSeverity;
  status: OccurrenceStatus;
  envolvido: string;
  perfilEnvolvido: 'Prestador' | 'Cliente';
  relator: string;
  regiao: string;
  data: string;
  descricao: string;
  notaInterna?: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  profile: 'Prestador' | 'Cliente';
  categoryOrNeighborhood: string;
  status: 'Ativo' | 'Suspenso' | 'Pendente';
  rating: number;
  servicesCount: number;
  joinedAt: string;
};

export const chartDataByRange: Record<TimeRange, ChartPoint[]> = {
  '7d': [
    { label: 'Seg', servicos: 142, receita: 28400, novosUsuarios: 18 },
    { label: 'Ter', servicos: 168, receita: 34200, novosUsuarios: 24 },
    { label: 'Qua', servicos: 155, receita: 31900, novosUsuarios: 21 },
    { label: 'Qui', servicos: 194, receita: 41800, novosUsuarios: 29 },
    { label: 'Sex', servicos: 221, receita: 48600, novosUsuarios: 34 },
    { label: 'Sáb', servicos: 248, receita: 53100, novosUsuarios: 31 },
    { label: 'Dom', servicos: 130, receita: 26500, novosUsuarios: 15 },
  ],
  '30d': [
    { label: 'Sem 1', servicos: 890, receita: 184000, novosUsuarios: 92 },
    { label: 'Sem 2', servicos: 1020, receita: 215000, novosUsuarios: 118 },
    { label: 'Sem 3', servicos: 1140, receita: 242000, novosUsuarios: 134 },
    { label: 'Sem 4', servicos: 1285, receita: 278500, novosUsuarios: 149 },
  ],
  '6m': [
    { label: 'Jun', servicos: 1620, receita: 312000, novosUsuarios: 140 },
    { label: 'Jul', servicos: 1840, receita: 368000, novosUsuarios: 165 },
    { label: 'Ago', servicos: 1990, receita: 405000, novosUsuarios: 182 },
    { label: 'Set', servicos: 2210, receita: 452000, novosUsuarios: 210 },
    { label: 'Out', servicos: 2390, receita: 498000, novosUsuarios: 228 },
    { label: 'Nov', servicos: 2580, receita: 546000, novosUsuarios: 254 },
  ],
};

export const categoryPerformanceMock = [
  { nome: 'Eletricista', chamados: 342, conclusao: 94, ticketMedio: 310 },
  { nome: 'Encanador', chamados: 298, conclusao: 91, ticketMedio: 275 },
  { nome: 'Pedreiro', chamados: 264, conclusao: 88, ticketMedio: 540 },
  { nome: 'Ar-Condicionado', chamados: 219, conclusao: 82, ticketMedio: 390 },
  { nome: 'Pintor', chamados: 186, conclusao: 93, ticketMedio: 460 },
  { nome: 'Montador', chamados: 154, conclusao: 96, ticketMedio: 190 },
];

export const proposalStatusBreakdown = [
  { label: 'Concluídos', value: 62, color: '#10B981' },
  { label: 'Em andamento', value: 18, color: '#1E3A8A' },
  { label: 'Pendentes', value: 11, color: '#FFD900' },
  { label: 'Recusados / Cancelados', value: 9, color: '#EF4444' },
];

export const initialAlertPoints: AlertPoint[] = [
  {
    id: 'al-01',
    titulo: 'Pico de cancelamentos na zona Oeste',
    descricao: 'Taxa de cancelamento em Pinheiros e Vila Madalena subiu 18% acima da média histórica nos últimos 7 dias.',
    severidade: 'critico',
    area: 'Operação Regional',
    metrica: '+18% cancelamentos',
    detectadoEm: 'Há 25 min',
    resolvido: false,
    acaoSugerida: 'Revisar prestadores com atraso recorrente na região',
  },
  {
    id: 'al-02',
    titulo: 'Gargalo de resposta em Ar-Condicionado',
    descricao: 'Tempo médio para primeira proposta atingiu 4h20 devido à alta demanda com o calor.',
    severidade: 'atencao',
    area: 'Oferta & Demanda',
    metrica: '4h20 tempo médio',
    detectadoEm: 'Há 2 horas',
    resolvido: false,
    acaoSugerida: 'Notificar prestadores inativos da categoria',
  },
  {
    id: 'al-03',
    titulo: 'Prestadores com avaliação em queda',
    descricao: '3 prestadores ativos registraram média inferior a 3,5 estrelas nas últimas 10 avaliações.',
    severidade: 'atencao',
    area: 'Qualidade',
    metrica: '3 perfis < 3.5★',
    detectadoEm: 'Hoje, 09:15',
    resolvido: false,
    acaoSugerida: 'Abrir auditoria preventiva de qualidade',
  },
  {
    id: 'al-04',
    titulo: 'Documentos aguardando validação',
    descricao: '6 novos cadastros de prestadores estão na fila há mais de 24 horas para aprovação.',
    severidade: 'info',
    area: 'Onboarding',
    metrica: '6 pendentes',
    detectadoEm: 'Hoje, 08:00',
    resolvido: false,
    acaoSugerida: 'Priorizar conferência de CPF e comprovante',
  },
];

export const initialOccurrences: OccurrenceRecord[] = [
  {
    id: 'occ-1',
    protocolo: 'OC-2048',
    titulo: 'Serviço não concluído após pagamento de sinal',
    tipo: 'Serviço não entregue',
    severidade: 'alta',
    status: 'aberto',
    envolvido: 'Marcos Ribeiro',
    perfilEnvolvido: 'Prestador',
    relator: 'Juliana Costa (Cliente)',
    regiao: 'Pinheiros, SP',
    data: '12 nov 2026, 19:40',
    descricao: 'Cliente relatou que o prestador não compareceu no segundo dia de obra e deixou de responder no chat.',
    notaInterna: 'Tentativa de contato telefônico agendada para amanhã às 09h.',
  },
  {
    id: 'occ-2',
    protocolo: 'OC-2047',
    titulo: 'Suspeita de perfil duplicado com mesmo CPF',
    tipo: 'Perfil suspeito',
    severidade: 'alta',
    status: 'em_analise',
    envolvido: 'Eduardo Silva',
    perfilEnvolvido: 'Prestador',
    relator: 'Sistema Antifraude',
    regiao: 'Mooca, SP',
    data: '12 nov 2026, 16:10',
    descricao: 'Detectada tentativa de cadastro utilizando telefone já associado a conta suspensa em setembro.',
    notaInterna: 'Aguardando envio de selfie com documento.',
  },
  {
    id: 'occ-3',
    protocolo: 'OC-2046',
    titulo: 'Divergência no valor cobrado fora do orçamento',
    tipo: 'Divergência de valor',
    severidade: 'media',
    status: 'em_analise',
    envolvido: 'Ana Souza',
    perfilEnvolvido: 'Prestador',
    relator: 'Roberto Almeida (Cliente)',
    regiao: 'Vila Mariana, SP',
    data: '11 nov 2026, 14:25',
    descricao: 'Cliente questiona acréscimo de R$ 140 referente a peça hidráulica não prevista na proposta inicial.',
  },
  {
    id: 'occ-4',
    protocolo: 'OC-2045',
    titulo: 'Atraso superior a 2 horas sem aviso prévio',
    tipo: 'Atraso recorrente',
    severidade: 'media',
    status: 'aberto',
    envolvido: 'Lucas Ferreira',
    perfilEnvolvido: 'Prestador',
    relator: 'Camila Duarte (Cliente)',
    regiao: 'Santana, SP',
    data: '10 nov 2026, 11:05',
    descricao: 'Segundo relato de atraso na semana. Cliente precisou remarcar compromisso profissional.',
  },
  {
    id: 'occ-5',
    protocolo: 'OC-2044',
    titulo: 'Cancelamento em cima da hora pelo cliente',
    tipo: 'Comportamento inadequado',
    severidade: 'baixa',
    status: 'resolvido',
    envolvido: 'client009 (Fernanda Lima)',
    perfilEnvolvido: 'Cliente',
    relator: 'Carlos Mendes (Prestador)',
    regiao: 'Jardim São Paulo, SP',
    data: '09 nov 2026, 09:30',
    descricao: 'Prestador já estava em deslocamento quando o chamado foi cancelado. Taxa de deslocamento compensada.',
    notaInterna: 'Caso encerrado com crédito de deslocamento aplicado.',
  },
];

const professionalUsers: AdminUser[] = mockProfessionals.map((prof, idx) => ({
  id: prof.uid,
  name: prof.nome,
  email: `${prof.nome.toLowerCase().replace(/\s+/g, '.')}@resolveja.com.br`,
  profile: 'Prestador',
  categoryOrNeighborhood: prof.categorias[0] ?? 'Geral',
  status: prof.status === 'ativo' ? 'Ativo' : 'Suspenso',
  rating: prof.avaliacaoMedia,
  servicesCount: prof.totalServicos,
  joinedAt: idx === 0 ? '10 jan 2026' : idx === 1 ? '18 fev 2026' : '04 mar 2026',
}));

const clientUsers: AdminUser[] = [
  {
    id: 'client001',
    name: 'Juliana Costa',
    email: 'juliana.costa@email.com',
    profile: 'Cliente',
    categoryOrNeighborhood: 'Pinheiros',
    status: 'Ativo',
    rating: 4.9,
    servicesCount: 14,
    joinedAt: '22 mar 2026',
  },
  {
    id: 'client002',
    name: 'Roberto Almeida',
    email: 'roberto.almeida@email.com',
    profile: 'Cliente',
    categoryOrNeighborhood: 'Vila Mariana',
    status: 'Ativo',
    rating: 4.7,
    servicesCount: 8,
    joinedAt: '15 abr 2026',
  },
  {
    id: 'client003',
    name: 'Marcos Ribeiro',
    email: 'marcos.ribeiro@email.com',
    profile: 'Prestador',
    categoryOrNeighborhood: 'Pedreiro',
    status: 'Pendente',
    rating: 3.4,
    servicesCount: 19,
    joinedAt: '02 nov 2026',
  },
];

export const initialAdminUsers: AdminUser[] = [...professionalUsers, ...clientUsers];

