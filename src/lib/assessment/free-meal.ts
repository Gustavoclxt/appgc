// VET corrigido = (VET diário × 7 − nº de refeições livres × VET da refeição livre) ÷ 7
import { fmtInt } from "./calculations";

export function calcularVetCorrigido(vetDiario: number | null, quantidade: number, vetRefeicao: number): number | null {
  if (vetDiario === null || !Number.isFinite(quantidade) || !Number.isFinite(vetRefeicao)) return null;
  return (vetDiario * 7 - quantidade * vetRefeicao) / 7;
}

export interface ResumoVetFinal {
  quantidade: string;
  vetRefeicao: string;
  vetFinal: number | null;
}

// Resume as refeições livres e o VET final ajustado para tela, cópia, PDF e análise.
export function resumoVetFinal(
  caloriasSugeridas: number | null,
  quantidadeStr: string,
  vetStr: string,
): ResumoVetFinal | null {
  const temQuantidade = quantidadeStr.trim() !== "";
  const temVet = vetStr.trim() !== "";
  if (!temQuantidade && !temVet) return null;
  const qtd = Number(quantidadeStr.replace(",", "."));
  const vet = Number(vetStr.replace(",", "."));
  const quantidade =
    temQuantidade && Number.isFinite(qtd)
      ? `${fmtInt(qtd)} ${qtd === 1 ? "refeição" : "refeições"}/semana`
      : "—";
  const vetRefeicao = temVet && Number.isFinite(vet) ? `${fmtInt(vet)} kcal` : "—";
  const vetFinal =
    temQuantidade && temVet && Number.isFinite(qtd) && Number.isFinite(vet)
      ? calcularVetCorrigido(caloriasSugeridas, qtd, vet)
      : null;
  return { quantidade, vetRefeicao, vetFinal };
}
