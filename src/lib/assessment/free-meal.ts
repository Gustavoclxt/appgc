// VET corrigido = (VET diário × 7 − nº de refeições livres × VET da refeição livre) ÷ 7
export function calcularVetCorrigido(vetDiario: number | null, quantidade: number, vetRefeicao: number): number | null {
  if (vetDiario === null || !Number.isFinite(quantidade) || !Number.isFinite(vetRefeicao)) return null;
  return (vetDiario * 7 - quantidade * vetRefeicao) / 7;
}
