import { fetchAddressByCep } from '../utils/cep';
import type { GeoPoint } from '../utils/geo';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Política de uso do Nominatim: no máximo 1 requisição por segundo.
 * Identificação da aplicação enviada via cabeçalho Referer.
 */
const MIN_INTERVAL_MS = 1100;

let lastRequestAt = 0;

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const wait = MIN_INTERVAL_MS - (now - lastRequestAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastRequestAt = Date.now();
}

async function nominatimSearch(query: string): Promise<GeoPoint | null> {
  if (!query.trim()) return null;

  await enforceRateLimit();

  const url = `${NOMINATIM_SEARCH_URL}?format=json&limit=1&countrycodes=br&accept-language=pt-BR&q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url, {
      headers: {
        Referer: `${window.location.origin}/`,
      },
    });

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

/**
 * Resolve um CEP em coordenadas: ViaCEP para o endereço completo +
 * geocoding do Nominatim para as coordenadas.
 */
export async function geocodeCep(cep: string): Promise<GeoPoint | null> {
  const address = await fetchAddressByCep(cep);
  if (!address) return null;

  const query = [
    address.logradouro,
    address.bairro,
    address.localidade,
    address.uf,
    'Brasil',
  ]
    .filter(Boolean)
    .join(', ');

  return nominatimSearch(query);
}
