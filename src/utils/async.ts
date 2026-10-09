/**
 * Encerra uma promise com timeout: se estourar o prazo, rejeita
 * para que o loading sempre termine (sucesso, erro ou vazio).
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeoutMs);
    }),
  ]);
}
