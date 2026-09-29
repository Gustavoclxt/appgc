import type { Refeicao } from "./types";

export interface RefeicaoRelatorio {
  id: string;
  refeicao: string;
  horario: string;
  local: string;
  alimentos: string[];
}

export function diarioParaRelatorio(refeicoes: Refeicao[]): RefeicaoRelatorio[] {
  return refeicoes
    .map((refeicao) => ({
      id: refeicao.id,
      refeicao: refeicao.refeicao || "Refeição",
      horario: refeicao.horario,
      local: refeicao.local,
      alimentos: refeicao.alimentos
        .filter((item) => item.alimento || item.quantidade)
        .map((item) =>
          [item.alimento || "Alimento não informado", item.quantidade].filter(Boolean).join(" — "),
        ),
    }))
    .filter((refeicao) => refeicao.horario || refeicao.local || refeicao.alimentos.length > 0);
}