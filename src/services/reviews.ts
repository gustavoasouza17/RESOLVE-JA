import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewTipo = 'cliente_para_prestador' | 'prestador_para_cliente';

export type Review = {
  id: string;
  proposalId: string;
  avaliadorId: string;
  avaliadoId: string;
  tipo: ReviewTipo;
  nota: number;
  comentario: string;
  criadoEm: string;
};

export type CreateReviewData = {
  proposalId: string;
  avaliadorId: string;
  avaliadoId: string;
  tipo: ReviewTipo;
  nota: number;
  comentario: string;
};

export type ReviewWithAuthor = Review & {
  autorNome: string;
  autorFotoUrl: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function mapReview(id: string, data: Record<string, unknown>): Review {
  return {
    id,
    proposalId: normalizeString(data.proposalId),
    avaliadorId: normalizeString(data.avaliadorId),
    avaliadoId: normalizeString(data.avaliadoId),
    tipo: (data.tipo as ReviewTipo) ?? 'cliente_para_prestador',
    nota: normalizeNumber(data.nota),
    comentario: normalizeString(data.comentario),
    criadoEm: normalizeString(data.criadoEm, new Date().toISOString()),
  };
}

async function getUserInfo(uid: string): Promise<{ nome: string; fotoUrl: string }> {
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      const data = userSnap.data() as Record<string, unknown>;
      return {
        nome: normalizeString(data.nome, 'Usuário'),
        fotoUrl: normalizeString(data.fotoUrl),
      };
    }
  } catch {
    // ignora e tenta a coleção professionals
  }

  try {
    const profSnap = await getDoc(doc(db, 'professionals', uid));
    if (profSnap.exists()) {
      const data = profSnap.data() as Record<string, unknown>;
      return {
        nome: normalizeString(data.nome, 'Usuário'),
        fotoUrl: normalizeString(data.fotoUrl),
      };
    }
  } catch {
    // ignora
  }

  return { nome: 'Usuário', fotoUrl: '' };
}

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Salva uma nova avaliação na coleção `reviews` e recalcula a média
 * de avaliações do usuário avaliado.
 */
export async function createReview(data: CreateReviewData): Promise<string> {
  const docRef = await addDoc(collection(db, 'reviews'), {
    ...data,
    criadoEm: new Date().toISOString(),
  });

  // Recalcula a média de avaliações do avaliado
  await updateUserRating(data.avaliadoId);

  return docRef.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Busca uma avaliação existente de um avaliador para uma proposta específica.
 * Usado para impedir reenvio (modo somente leitura).
 */
export async function getReviewByProposalAndAvaliador(
  proposalId: string,
  avaliadorId: string,
): Promise<Review | null> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('proposalId', '==', proposalId),
      where('avaliadorId', '==', avaliadorId),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const docSnap = snapshot.docs[0];
    return mapReview(docSnap.id, docSnap.data() as Record<string, unknown>);
  } catch (error) {
    console.warn('Erro ao buscar avaliação:', error);
    return null;
  }
}

/**
 * Busca todas as avaliações recebidas por um usuário (avaliadoId),
 * com nome e foto do avaliador resolvidos.
 */
export async function getReviewsForUser(
  avaliadoId: string,
): Promise<ReviewWithAuthor[]> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('avaliadoId', '==', avaliadoId),
      orderBy('criadoEm', 'desc'),
    );
    const snapshot = await getDocs(q);

    const reviews: ReviewWithAuthor[] = [];
    for (const docSnap of snapshot.docs) {
      const review = mapReview(docSnap.id, docSnap.data() as Record<string, unknown>);
      const author = await getUserInfo(review.avaliadorId);
      reviews.push({ ...review, autorNome: author.nome, autorFotoUrl: author.fotoUrl });
    }
    return reviews;
  } catch (error) {
    console.warn('Erro ao buscar avaliações:', error);
    return [];
  }
}

// ─── Update rating ────────────────────────────────────────────────────────────

/**
 * Recalcula a média de avaliações (`notaMedia`/`totalAvaliacoes`) de um usuário
 * a partir de todas as avaliações recebidas na coleção `reviews`.
 *
 * Atualiza tanto a coleção `users` (conforme especificação) quanto a coleção
 * `professionals` (usada na listagem de prestadores).
 */
export async function updateUserRating(avaliadoId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('avaliadoId', '==', avaliadoId),
    );
    const snapshot = await getDocs(q);

    const notas = snapshot.docs.map((d) => normalizeNumber(d.data().nota));
    const totalAvaliacoes = notas.length;
    const notaMedia =
      totalAvaliacoes > 0
        ? Math.round((notas.reduce((a, b) => a + b, 0) / totalAvaliacoes) * 10) / 10
        : 0;

    // Coleção `users` (conforme especificação)
    try {
      await updateDoc(doc(db, 'users', avaliadoId), {
        notaMedia,
        totalAvaliacoes,
      });
    } catch {
      // usuário pode não existir na coleção users — ignora
    }

    // Coleção `professionals` (usada na listagem de prestadores)
    try {
      await updateDoc(doc(db, 'professionals', avaliadoId), {
        avaliacaoMedia: notaMedia,
        totalAvaliacoes,
      });
    } catch {
      // usuário pode não ser prestador — ignora
    }
  } catch (error) {
    console.warn('Erro ao atualizar média de avaliações:', error);
  }
}
