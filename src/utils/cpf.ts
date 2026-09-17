/**
 * Remove caracteres não numéricos de uma string
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Aplica máscara de CPF (000.000.000-00)
 */
export function applyCpfMask(value: string): string {
  const numbers = onlyNumbers(value);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Valida o dígito verificador do CPF
 * Retorna true se o CPF for válido
 */
export function validateCpf(cpf: string): boolean {
  const numbers = onlyNumbers(cpf);

  // Deve ter exatamente 11 dígitos
  if (numbers.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9], 10)) return false;

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10], 10)) return false;

  return true;
}

/**
 * Formata CPF para exibição (com máscara)
 */
export function formatCpfForDisplay(cpf: string): string {
  return applyCpfMask(cpf);
}

/**
 * Verifica se o CPF tem o comprimento completo (11 dígitos)
 */
export function isCompleteCpf(cpf: string): boolean {
  return onlyNumbers(cpf).length === 11;
}