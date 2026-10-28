// Faixa e formatação do consumo diário de água (slider de 0 a 6 L, em passos de 0,25 L).
export const AGUA_MIN = 0;
export const AGUA_MAX = 6;
export const AGUA_PASSO = 0.25;

// Marcação da régua abaixo da trilha: um tick a cada 0,5 L (0, 0,5, 1 … 6).
export const escalaAgua: number[] = Array.from({ length: AGUA_MAX / 0.5 + 1 }, (_, i) => i * 0.5);

// Lê litros a partir do valor armazenado (ex.: "1,5 L/dia"); texto livre não reconhecido volta a 0.
export function lerLitrosAgua(valor: string): number {
  const bruto = valor.trim().match(/^(\d+(?:[.,]\d+)?)\s*L/i)?.[1];
  if (!bruto) return 0;
  return Math.min(AGUA_MAX, Math.max(AGUA_MIN, Number(bruto.replace(",", "."))));
}

// Formata só o número: vírgula como separador e sem zeros à direita (1,5 / 0,25 / 2).
export function formatarLitros(litros: number): string {
  return litros.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

// Valor completo armazenado na sessão e exibido nos relatórios.
export function formatarLitrosAgua(litros: number): string {
  return `${formatarLitros(litros)} L/dia`;
}
