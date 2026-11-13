import { fetchAddressByCep } from '../utils/cep';
import type { GeoPoint } from '../utils/geo';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Política de uso do Nominatim: no máximo 1 requisição por segundo.
 * Identificação da aplicação enviada via cabeçalho Referer.
 */
const MIN_INTERVAL_MS = 1100;

/** Timeout de segurança para requisições de rede (ms). */
const NETWORK_TIMEOUT_MS = 10000;

let lastRequestAt = 0;

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();
}

/**
 * `fetch` com timeout de segurança: aborta a requisição quando
 * estoura o prazo, evitando promises que nunca resolvem.
 */
async function fetchJsonWithTimeout(
  url: string,
  timeoutMs = NETWORK_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        Referer: `${window.location.origin}/`,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function nominatimSearch(query: string): Promise<GeoPoint | null> {
  if (!query.trim()) return null;

  await enforceRateLimit();

  const url = `${NOMINATIM_SEARCH_URL}?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetchJsonWithTimeout(url);

    if (!response.ok) return null;

    const data: Array<{ lat: string; lon: string }> = await response.json();
    if (!data.length) return null;

    const latitude = Number(data[0].lat);
    const longitude = Number(data[0].lon);

    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : null;
  } catch (error) {
    console.warn('Erro ao geocodificar endereço:', error);
    return null;
  }
}

/**
 * Geocodifica uma query de endereço livre (bairro, cidade, logradouro…)
 * usando o OpenStreetMap/Nominatim.
 */
export async function geocodeAddress(query: string): Promise<GeoPoint | null> {
  return nominatimSearch(query);
}

export type CepLocation = {
  point: GeoPoint;
  cep: string;
  /** Endereço formatado para exibição: "Bairro, Cidade - UF". */
  label: string;
  /** Partes do endereço resolvidas pelo ViaCEP. */
  address: { bairro: string; localidade: string; uf: string };
};

/**
 * Resolve um CEP em coordenadas — o MESMO caminho usado pelo fluxo de
 * perfil do prestador (`syncProfessionalLocation` → `geocodeCep`):
 *
 * 1. ViaCEP resolve o CEP no endereço completo;
 * 2. Nominatim (OpenStreetMap) geocodifica o endereço.
 *
 * A HomePage deve chamar esta função (e não duplicar a lógica).
 */
export async function resolveCepLocation(
  cep: string
): Promise<CepLocation | null> {
  const address = await fetchAddressByCep(cep);
  if (!address) return null;

  // Tenta o endereço completo primeiro; se o geocoding retornar
  // vazio, simplifica progressivamente até o centro da cidade.
  const queries = [
    [address.logradouro, address.bairro, address.localidade, address.uf, 'Brasil'],
    [address.bairro, address.localidade, address.uf, 'Brasil'],
    [address.localidade, address.uf, 'Brasil'],
  ].map((parts) => parts.filter(Boolean).join(', '));

  let point: GeoPoint | null = null;

  for (const query of queries) {
    point = await nominatimSearch(query);
    if (point) break;
  }

  if (!point) return null;

  return {
    point,
    cep: address.cep,
    label: `${address.bairro}, ${address.localidade} - ${address.uf}`,
    address: {
      bairro: address.bairro,
      localidade: address.localidade,
      uf: address.uf,
    },
  };
}

/**
 * Resolve um CEP em coordenadas (ViaCEP + geocoding Nominatim).
 */
export async function geocodeCep(cep: string): Promise<GeoPoint | null> {
  const resolved = await resolveCepLocation(cep);
  return resolved?.point ?? null;
}
