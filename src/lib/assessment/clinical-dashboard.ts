import type { AnaliseIA } from "./types";

export interface PainelSecaoLista {
  titulo: string;
  itens: string[];
  tom?: "prioridade" | "monitorar" | "favoravel";
}

/** Estrutura compartilhada pela prévia, cópia e PDF do painel clínico. */
export function painelClinicoParaRelatorio(analise: AnaliseIA) {
  const achados: PainelSecaoLista[] = [
    { titulo: "Prioridade", itens: analise.achados.prioridade, tom: "prioridade" },
    { titulo: "Monitorar", itens: analise.achados.monitorar, tom: "monitorar" },
    { titulo: "Favoráveis", itens: analise.achados.favoraveis, tom: "favoravel" },
  ].filter((grupo) => grupo.itens.length > 0);

  return {
    resumo: analise.resumoClinico,
    achados,
    estrategia: analise.estrategiaInicial.filter((grupo) => grupo.acoes.length > 0),
    foco: analise.focoProximoRetorno.slice(0, 5),
    reavaliar: analise.reavaliarRetorno,
  };
}