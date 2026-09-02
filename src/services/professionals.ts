import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FALLBACK_AVATAR_IMAGE } from '../components/atoms/Avatar';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * Formato normalizado de profissional ativo para exibição nos cards da HomePage.
 * Usa o mesmo schema salvo no cadastro do prestador (coleção `professionals`),
 * com fallbacks seguros para campos ainda não preenchidos.
 */
export type ProfessionalCardData = {
  uid: string;
  nome: string;
  bio: string;
  fotoUrl: string;
  categorias: string[];
  bairrosAtendimento: string[];
  portfolio: string[];
  totalServicos: number;
  distanciaKm: number;
  avaliacaoMedia: number;
  totalAvaliacoes: number;
  valorDiaria: string;
  whatsapp: string;
};

// Placeholder usado quando o prestador ainda não enviou foto
const FALLBACK_IMAGE = FALLBACK_AVATAR_IMAGE;

// ─── Helpers de normalização ──────────────────────────────────────────────────

function normalizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function mapProfessional(
  uid: string,
  userData: Record<string, unknown>,
  professionalData: Record<string, unknown>,
): ProfessionalCardData {
  // Foto: `professionals` → `users` → placeholder local
  const fotoUrl =
    normalizeString(professionalData.fotoUrl) ||
    normalizeString(userData.fotoUrl) ||
    FALLBACK_IMAGE;

  // Categorias: `professionals` → `users` → fallback genérico
  const categorias = normalizeStringArray(professionalData.categorias);
  if (categorias.length === 0) {
    categorias.push(...normalizeStringArray(userData.categorias));
  }
  if (categorias.length === 0) {
    categorias.push('Profissional');
  }

  return {
    uid,
    nome:
      normalizeString(professionalData.nome) ||
      normalizeString(userData.nome) ||
      'Profissional',
    bio: normalizeString(professionalData.bio),
    fotoUrl,
    categorias,
    bairrosAtendimento: normalizeStringArray(professionalData.bairrosAtendimento),
    portfolio: normalizeStringArray(professionalData.portfolio),
    totalServicos: normalizeNumber(professionalData.totalServicos),
    distanciaKm: normalizeNumber(professionalData.distanciaKm),
    avaliacaoMedia: normalizeNumber(professionalData.avaliacaoMedia),
    totalAvaliacoes: normalizeNumber(professionalData.totalAvaliacoes),
    valorDiaria: normalizeString(professionalData.valorDiaria, 'Sob consulta'),
    whatsapp: normalizeString(professionalData.whatsapp),
  };
}

// ─── Serviço ──────────────────────────────────────────────────────────────────

/**
 * Busca os profissionais ativos no Firestore.
 *
 * 1. Consulta a coleção `users` filtrando `perfil == "prestador"` e `status == "ativo"`.
 * 2. Para cada usuário encontrado, carrega o documento correspondente da coleção
 *    `professionals` (schema salvo no cadastro do prestador) e mescla os dados,
 *    aplicando fallbacks para campos ausentes.
 *
 * @returns Lista de profissionais ativos normalizada para os cards da HomePage.
 */
export async function getProfessionals(): Promise<ProfessionalCardData[]> {
  // Obs.: caso o Firestore retorne erro de índice composto, criar o índice
  // composto (perfil + status) na coleção `users` no Firebase Console.
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('perfil', '==', 'prestador'),
    where('status', '==', 'ativo'),
  );

  const snapshot = await getDocs(q);

  const professionals: ProfessionalCardData[] = [];

  for (const userSnap of snapshot.docs) {
    const uid = userSnap.id;
    const userData = userSnap.data() as Record<string, unknown>;

    let professionalData: Record<string, unknown> = {};
    try {
      const profRef = doc(db, 'professionals', uid);
      const profSnap = await getDoc(profRef);
      if (profSnap.exists()) {
        professionalData = profSnap.data() as Record<string, unknown>;
      }
    } catch {
      // Sem permissão ou erro de rede — segue apenas com os dados da coleção `users`
    }

    professionals.push(mapProfessional(uid, userData, professionalData));
  }

  return professionals;
}

/**
 * Conta quantas propostas concluídas existem para um prestador.
 * Lê em tempo real — atualiza automaticamente quando o status muda.
 */
export function subscribeToCompletedServicesCount(
  prestadorId: string,
  callback: (count: number) => void,
) {
  const q = query(
    collection(db, 'proposals'),
    where('prestadorId', '==', prestadorId),
    where('status', '==', 'concluido'),
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}

export async function getCompletedServicesCount(prestadorId: string): Promise<number> {
  const q = query(
    collection(db, 'proposals'),
    where('prestadorId', '==', prestadorId),
    where('status', '==', 'concluido'),
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}