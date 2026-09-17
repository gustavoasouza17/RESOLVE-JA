/**
 * Remove caracteres não numéricos de uma string
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CEP (00000-000)
 */
export function applyCepMask(value: string): string {
  const numbers = onlyNumbers(value);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Verifica se o CEP tem o formato completo (8 dígitos)
 */
export function isCompleteCep(cep: string): boolean {
  return onlyNumbers(cep).length === 8;
}

/**
 * Formata CEP para exibição (com máscara)
 */
export function formatCepForDisplay(cep: string): string {
  return applyCepMask(cep);
}

/**
 * Busca endereço via API ViaCEP
 * Retorna objeto com dados do endereço ou null se não encontrado
 */
export async function fetchAddressByCep(cep: string): Promise<{
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
} | null> {
  const numbers = onlyNumbers(cep);
  if (numbers.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
    };
  } catch (error) {
    console.warn('Erro ao buscar CEP:', error);
    return null;
  }
}

/**
 * Busca coordenadas aproximadas via API (usando Nominatim)
 * Retorna { lat, lng } ou null
 */
export async function fetchCoordsByCep(cep: string): Promise<{ lat: number; lng: number } | null> {
  const numbers = onlyNumbers(cep);
  if (numbers.length !== 8) return null;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${numbers},%20Brasil&limit=1`,
      { headers: { 'User-Agent': 'ResolveJa/1.0' } }
    );
    const data = await response.json();
    
    if (data.length === 0) return null;
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.warn('Erro ao buscar coordenadas do CEP:', error);
    return null;
  }
}