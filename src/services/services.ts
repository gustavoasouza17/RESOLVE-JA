import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { getProfessionals, type ProfessionalCardData } from './professionals';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceHistoryItem = {
  id: string;
  service: string;
  status: string;
  date: string;
  professionalName: string;
  category: string;
  professionalPhoto: string;
  prestadorId: string;
};

export type RecommendedProfessional = ProfessionalCardData;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pendente':
      return 'Pendente';
    case 'aceita':
      return 'Aceita';
    case 'concluido':
      return 'Concluída';
    case 'recusada':
      return 'Recusada';
    default:
      return status || 'Pendente';
  }
}

function formatDate(value: unknown): string {
  let date: Date;
  if (value instanceof Timestamp) {
    date = value.toDate();
  } else if (typeof value === 'string') {
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else {
    date = new Date();
  }
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Service History ──────────────────────────────────────────────────────────

/**
 * Busca o histórico de serviços de um cliente na coleção `proposals`.
 *
 * 1. Consulta a coleção `proposals` filtrando `clienteId == clienteUid`,
 *    ordenado por `criadoEm` (mais recente primeiro).
 * 2. Para cada proposta, busca o documento correspondente na coleção
 *    `professionals` para obter nome, foto e categoria do prestador.
 *
 * @param clienteUid UID do cliente autenticado.
 * @returns Lista de itens do histórico normalizada para exibição.
 */
export async function deleteProposalById(proposalId: string): Promise<void> {
  await deleteDoc(doc(db, 'proposals', proposalId));
}

export async function getServiceHistory(
  clienteUid: string,
): Promise<ServiceHistoryItem[]> {
  const proposalsRef = collection(db, 'proposals');
  const q = query(
    proposalsRef,
    where('clienteId', '==', clienteUid),
  );

  const snapshot = await getDocs(q);

  const items: ServiceHistoryItem[] = [];

  for (const proposalSnap of snapshot.docs) {
    const data = proposalSnap.data() as Record<string, unknown>;
    const prestadorId = normalizeString(data.prestadorId);

    // Busca dados do profissional para obter nome, foto e categoria
    let professionalName = 'Profissional';
    let professionalPhoto = '';
    let category = 'Profissional';

    if (prestadorId) {
      try {
        const profRef = doc(db, 'professionals', prestadorId);
        const profSnap = await getDoc(profRef);
        if (profSnap.exists()) {
          const profData = profSnap.data() as Record<string, unknown>;
          professionalName = normalizeString(profData.nome, 'Profissional');
          professionalPhoto = normalizeString(profData.fotoUrl);
          const categorias = Array.isArray(profData.categorias)
            ? profData.categorias.filter(
                (item): item is string => typeof item === 'string',
              )
            : [];
          category = categorias[0] ?? 'Profissional';
        }
      } catch {
        // Sem permissão ou erro de rede — mantém fallbacks
      }
    }

    items.push({
      id: proposalSnap.id,
      service: normalizeString(data.descricao, 'Serviço'),
      status: getStatusLabel(normalizeString(data.status, 'pendente')),
      date: formatDate(data.criadoEm ?? data.dataDesejada),
      professionalName,
      category,
      professionalPhoto,
      prestadorId,
    });
  }

  return items.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

// ─── Recommended Professionals ────────────────────────────────────────────────

/**
 * Calcula a categoria mais recorrente no histórico do cliente e busca
 * profissionais ativos dessa categoria que o cliente ainda não contratou.
 *
 * @param clienteUid UID do cliente autenticado.
 * @returns Lista de profissionais recomendados (vazia se não houver recorrência).
 */
export async function getRecommendedProfessionals(
  clienteUid: string,
): Promise<RecommendedProfessional[]> {
  // 1. Busca o histórico do cliente
  const history = await getServiceHistory(clienteUid);

  if (history.length < 2) return [];

  // 2. Conta as categorias mais recorrentes
  const categoryCount = new Map<string, number>();
  for (const item of history) {
    categoryCount.set(item.category, (categoryCount.get(item.category) ?? 0) + 1);
  }

  // 3. Encontra a categoria com maior recorrência (2+ ocorrências)
  let topCategory = '';
  let topCount = 0;
  for (const [cat, count] of categoryCount.entries()) {
    if (count > topCount) {
      topCount = count;
      topCategory = cat;
    }
  }

  // Se nenhuma categoria aparece pelo menos 2 vezes, não recomendar
  if (topCount < 2 || !topCategory) return [];

  // 4. Busca todos os profissionais ativos
  const allProfessionals = await getProfessionals();

  // 5. IDs dos profissionais já contratados pelo cliente
  const contractedIds = new Set<string>();
  for (const item of history) {
    if (item.prestadorId) contractedIds.add(item.prestadorId);
  }

  // 6. Filtra profissionais da categoria recomendada que o cliente não contratou
  const recommended = allProfessionals.filter(
    (prof) =>
      prof.categorias.includes(topCategory) &&
      !contractedIds.has(prof.uid),
  );

  // Se não houver profissionais da categoria, retorna os melhores avaliados
  if (recommended.length === 0) {
    return allProfessionals
      .filter((prof) => !contractedIds.has(prof.uid))
      .sort((a, b) => b.avaliacaoMedia - a.avaliacaoMedia)
      .slice(0, 4);
  }

  return recommended.slice(0, 4);
}