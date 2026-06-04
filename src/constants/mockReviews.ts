export type MockReview = {
  id: string;
  autorId: string;
  destinatarioId: string;
  proposalId: string;
  estrelas: number;
  comentario: string;
  tipoAutor: 'cliente' | 'prestador';
  criadoEm: string;
};

const mockReviews: MockReview[] = [
  {
    id: 'rev001',
    autorId: 'client001',
    destinatarioId: 'prof001',
    proposalId: 'prop001',
    estrelas: 5,
    comentario: 'Excelente serviço, muito profissional e pontual. Recomendo!',
    tipoAutor: 'cliente',
    criadoEm: '2026-06-12T09:00:00Z',
  },
  {
    id: 'rev002',
    autorId: 'client002',
    destinatarioId: 'prof002',
    proposalId: 'prop002',
    estrelas: 4,
    comentario: 'Trabalho bem feito, mas demorou um pouco além do previsto.',
    tipoAutor: 'cliente',
    criadoEm: '2026-06-05T11:15:00Z',
  },
  {
    id: 'rev003',
    autorId: 'client003',
    destinatarioId: 'prof003',
    proposalId: 'prop003',
    estrelas: 3,
    comentario: 'Serviço satisfatório, mas o preço ficou um pouco acima do esperado.',
    tipoAutor: 'cliente',
    criadoEm: '2026-06-07T14:05:00Z',
  },
  {
    id: 'rev004',
    autorId: 'client004',
    destinatarioId: 'prof004',
    proposalId: 'prop004',
    estrelas: 5,
    comentario: 'A pintura ficou ótima e o acabamento ficou impecável.',
    tipoAutor: 'cliente',
    criadoEm: '2026-06-16T08:20:00Z',
  },
  {
    id: 'rev005',
    autorId: 'client005',
    destinatarioId: 'prof005',
    proposalId: 'prop005',
    estrelas: 5,
    comentario: 'Ótimo atendimento e montagem rápida. Fiquei muito satisfeito.',
    tipoAutor: 'cliente',
    criadoEm: '2026-06-10T10:45:00Z',
  },
];

export default mockReviews;
