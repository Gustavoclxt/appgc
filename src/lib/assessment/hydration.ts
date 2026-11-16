// Faixa e formatação do consumo diário de água (slider de 0 a 6 L, em passos de 0,1 L).
export const AGUA_MIN = 0;
export const AGUA_MAX = 6;
export const AGUA_PASSO = 0.1;

// Marcação da régua abaixo da trilha: um tick a cada 1 L (0, 1, 2 … 6), clicável.
export const escalaAgua: number[] = Array.from({ length: AGUA_MAX + 1 }, (_, i) => i);

// Pontos intermediários da régua: meio litro entre cada marca (0,5; 1,5 … 5,5), clicáveis.
export const escalaAguaMeio: number[] = Array.from({ length: AGUA_MAX }, (_, i) => i + 0.5);

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

// Comparação da ingestão com a meta arredondada exibida em "Hidratação recomendada".
export type IngestaoAgua = "adequada" | "moderada" | "insuficiente";

/**
 * Compara a ingestão (L/dia) com a meta (mL/dia) arredondada como ela aparece no relatório.
 * Igual ou acima da meta => adequada; abaixo dela, acima de 50% da meta => moderada;
 * 50% ou menos => insuficiente.
 */
export function classificarIngestaoAgua(litros: number, metaMl: number): IngestaoAgua {
  const meta = Math.round(metaMl);
  const ingestao = Math.round(litros * 1000);
  if (ingestao >= meta) return "adequada";
  return ingestao > meta * 0.5 ? "moderada" : "insuficiente";
}
