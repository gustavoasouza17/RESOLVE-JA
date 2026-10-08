import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { FALLBACK_AVATAR_IMAGE } from '../components/atoms/Avatar';
import { onlyNumbers } from '../utils/cep';
import { geocodeAddress, geocodeCep } from './geocoding';
import {
  isValidLatitude,
  isValidLongitude,
  type GeoPoint,
} from '../utils/geo';

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
  /** Coordenadas reais do prestador (null quando ainda não geocodificado). */
  latitude: number | null;
  longitude: number | null;
  /** Chave do endereço usado na última geocodificação (evita re-geocodificar). */
  enderecoGeocodado: string;
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

function normalizeCoordinate(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
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

  // Coordenadas: `professionals` → `users` → null (não inventa posição)
  const latitude =
    normalizeCoordinate(professionalData.latitude) ??
    normalizeCoordinate(userData.latitude);
  const longitude =
    normalizeCoordinate(professionalData.longitude) ??
    normalizeCoordinate(userData.longitude);

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
    latitude: isValidLatitude(latitude) ? latitude : null,
    longitude: isValidLongitude(longitude) ? longitude : null,
    enderecoGeocodado: normalizeString(professionalData.enderecoGeocodado),
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

// ─── Coordenadas do prestador ────────────────────────────────────────

export type ProfessionalLocationInput = {
  /** CEP opcional do prestador (8 dígitos, já numericado). */
  cep?: string;
  /** Bairros de atendimento informados no perfil. */
  neighborhoods: string[];
  cidade?: string;
};

/**
 * Gera e salva as coordenadas (`latitude`/`longitude`) do prestador a
 * partir do CEP/bairros de atendimento:
 *
 * 1. ViaCEP resolve o CEP no endereço completo;
 * 2. Nominatim (OpenStreetMap) geocodifica o endereço em coordenadas;
 * 3. O resultado é persistido nas coleções `professionals` e `users`.
 *
 * Só geocodifica quando o endereço mudou — a chave do endereço
 * (`enderecoGeocodado`) é comparada com a salva no Firestore, respeitando
 * o limite de 1 requisição/segundo do Nominatim.
 *
 * @returns Coordenadas salvas (ou já existentes) ou `null` quando não
 * foi possível geocodificar.
 */
export async function syncProfessionalLocation(
  uid: string,
  input: ProfessionalLocationInput
): Promise<GeoPoint | null> {
  const cepNumbers = onlyNumbers(input.cep ?? '');

  const neighborhoodsKey = [...new Set(
    input.neighborhoods
      .map((neighborhood) => neighborhood.trim().toLowerCase())
      .filter(Boolean)
  )]
    .sort()
    .join('|');

  const addressKey =
    cepNumbers.length === 8 ? `cep:${cepNumbers}` : neighborhoodsKey;

  if (!addressKey) return null;

  // Lê o documento atual para comparar com o endereço já geocodificado
  let storedCoordinates: GeoPoint | null = null;
  let storedKey = '';

  try {
    const snapshot = await getDoc(doc(db, 'professionals', uid));
    if (snapshot.exists()) {
      const data = snapshot.data() as Record<string, unknown>;
      const latitude = normalizeCoordinate(data.latitude);
      const longitude = normalizeCoordinate(data.longitude);

      if (
        isValidLatitude(latitude) &&
        isValidLongitude(longitude)
      ) {
        storedCoordinates = { latitude, longitude };
      }
      storedKey =
        typeof data.enderecoGeocodado === 'string'
          ? data.enderecoGeocodado
          : '';
    }
  } catch (error) {
    console.warn('Não foi possível ler as coordenadas salvas:', error);
  }

  // Endereço inalterado: reutiliza as coordenadas já salvas
  if (storedKey === addressKey && storedCoordinates) {
    return storedCoordinates;
  }

  let point: GeoPoint | null = null;

  if (cepNumbers.length === 8) {
    point = await geocodeCep(cepNumbers);
  }

  if (!point) {
    const query = [
      ...new Set(
        [...input.neighborhoods, input.cidade ?? '']
          .map((value) => value.trim())
          .filter(Boolean)
      ),
    ].join(', ');

    point = await geocodeAddress(`${query}, Brasil`);
  }

  if (!point) return null;

  const payload = {
    latitude: point.latitude,
    longitude: point.longitude,
    enderecoGeocodado: addressKey,
    atualizadoEm: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'professionals', uid), payload, { merge: true });
    await setDoc(doc(db, 'users', uid), payload, { merge: true });
  } catch (error) {
    console.warn('Não foi possível salvar as coordenadas do prestador:', error);
  }

  return point;
}