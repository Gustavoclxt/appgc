import type { Refeicao } from "./types";

// Locais disponíveis para cada refeição do recordatório (e do dia atípico).
// Fica aqui para que a tela, o relatório e o PDF usem exatamente as mesmas opções.
export const LOCAIS_REFEICAO = [
  "Casa",
  "Trabalho",
  "Restaurante",
  "Escola",
  "Lanchonete",
  "Pizzaria",

  "Padaria",
  "Cafeteria",
  "Fast-food",
  "Em deslocamento",
  "Casa de familiares/amigos",
  "Academia",
  "Hotel",
] as const;

export function opcoesDeLocal(valorAtual: string): { value: string; label: string }[] {
  const opcoes: { value: string; label: string }[] = LOCAIS_REFEICAO.map((local) => ({ value: local, label: local }));
  // Um valor que não esteja na lista (ex.: copiado de outra avaliação) precisa continuar visível.
  if (valorAtual && !opcoes.some((o) => o.value === valorAtual)) opcoes.push({ value: valorAtual, label: valorAtual });
  return opcoes;
}

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