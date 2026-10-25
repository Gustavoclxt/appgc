import type { AnaliseIA } from "./types";

/** Preserve complete review lists; only the immediate-return priorities are capped. */
export function normalizarAnalise(resultado: Record<string, unknown>): AnaliseIA {
  const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const listaTextos = (valor: unknown, limite?: number) =>
    (Array.isArray(valor) ? valor : []).map(texto).filter(Boolean).slice(0, limite);
  const objetos = (valor: unknown) =>
    (Array.isArray(valor) ? valor : []).filter(
      (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
    );
  const achados = typeof resultado["achados"] === "object" && resultado["achados"] !== null
    ? resultado["achados"] as Record<string, unknown> : {};
  return {
    resumoClinico: objetos(resultado["resumoClinico"])
      .map((item) => ({ label: texto(item["label"]).toUpperCase(), valor: texto(item["valor"]) }))
      .filter((item) => item.label && item.valor).slice(0, 11),
    achados: {
      prioridade: listaTextos(achados["prioridade"]),
      monitorar: listaTextos(achados["monitorar"]),
      favoraveis: listaTextos(achados["favoraveis"]),
    },
    estrategiaInicial: objetos(resultado["estrategiaInicial"])
      .map((item) => ({ categoria: texto(item["categoria"]).toUpperCase(), acoes: listaTextos(item["acoes"]) }))
      .filter((item) => item.categoria && item.acoes.length > 0),
    focoProximoRetorno: listaTextos(resultado["focoProximoRetorno"], 5),
    reavaliarRetorno: listaTextos(resultado["reavaliarRetorno"]),
  };
}