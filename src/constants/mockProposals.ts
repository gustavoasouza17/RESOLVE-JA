export type MockProposal = {
  id: string;
  clienteId: string;
  prestadorId: string;
  descricao: string;
  endereco: string;
  dataDesejada: string;
  orcamentoCliente: number;
  contraPropostaPrestador?: number;
  status: 'pendente' | 'aceita' | 'recusada';
  criadoEm: string;
  atualizadoEm?: string;
};

const mockProposals: MockProposal[] = [
  {
    id: 'prop001',
    clienteId: 'client001',
    prestadorId: 'prof001',
    descricao: 'Preciso trocar o revestimento do banheiro e consertar a ducha.',
    endereco: 'Rua das Flores, 123 — Jardim São Paulo',
    dataDesejada: '2026-06-25',
    orcamentoCliente: 850,
    contraPropostaPrestador: 920,
    status: 'pendente',
    criadoEm: '2026-06-01T14:30:00Z',
    atualizadoEm: '2026-06-02T10:15:00Z',
  },
  {
    id: 'prop002',
    clienteId: 'client002',
    prestadorId: 'prof002',
    descricao: 'Vazamento na cozinha e substituição de válvula do registro.',
    endereco: 'Av. Mooca, 750 — Mooca',
    dataDesejada: '2026-06-20',
    orcamentoCliente: 420,
    status: 'aceita',
    criadoEm: '2026-05-28T09:20:00Z',
    atualizadoEm: '2026-05-28T16:40:00Z',
  },
  {
    id: 'prop003',
    clienteId: 'client003',
    prestadorId: 'prof003',
    descricao: 'Instalação de pontos de luz adicionais na sala e no corredor.',
    endereco: 'Rua do Horto, 45 — Pinheiros',
    dataDesejada: '2026-06-22',
    orcamentoCliente: 600,
    status: 'recusada',
    criadoEm: '2026-05-30T11:10:00Z',
    atualizadoEm: '2026-06-01T08:55:00Z',
  },
  {
    id: 'prop004',
    clienteId: 'client004',
    prestadorId: 'prof004',
    descricao: 'Pintura da sala e retoque na parede externa da varanda.',
    endereco: 'Rua Harmonia, 230 — Vila Madalena',
    dataDesejada: '2026-06-27',
    orcamentoCliente: 780,
    status: 'pendente',
    criadoEm: '2026-06-03T12:00:00Z',
  },
  {
    id: 'prop005',
    clienteId: 'client005',
    prestadorId: 'prof005',
    descricao: 'Montagem de armário novo e pequenas adaptações em uma escrivaninha.',
    endereco: 'Av. Brasil, 980 — Santana',
    dataDesejada: '2026-06-24',
    orcamentoCliente: 520,
    status: 'aceita',
    criadoEm: '2026-05-29T08:40:00Z',
    atualizadoEm: '2026-05-30T10:20:00Z',
  },
];

export default mockProposals;
