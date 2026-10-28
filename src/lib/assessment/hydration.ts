// Faixa e formatação do consumo diário de água (slider de 0 a 6 L, em passos de 0,25 L).
export const AGUA_MIN = 0;
export const AGUA_MAX = 6;
export const AGUA_PASSO = 0.25;

// Lê litros a partir do valor armazenado (ex.: "1,5 L/dia"); texto livre não reconhecido volta a 0.
export function lerLitrosAgua(valor: string): number {
  const m = valor.trim().match(/^(\d+(?:[.,]\d+)?)\s*L/i);
  if (!m) return 0;
  return Math.min(AGUA_MAX, Math.max(AGUA_MIN, Number(m[1].replace(",", "."))));
}

// Formata só o número: vírgula como separador e sem zeros à direita (1,5 / 0,25 / 2).
export function formatarLitros(litros: number): string {
  return litros.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

// Valor completo armazenado na sessão e exibido nos relatórios.
export function formatarLitrosAgua(litros: number): string {
  return `${formatarLitros(litros)} L/dia`;
}
