import type { IntervencaoIA, PrioridadeIntervencao } from "./types";

export const PRIORIDADES: { id: PrioridadeIntervencao; label: string }[] = [
  { id: "alta", label: "Prioridade alta" },
  { id: "moderada", label: "Prioridade moderada" },
  { id: "baixa", label: "Prioridade baixa / otimização" },
];

/** Agrupa intervenções por prioridade e, dentro dela, por categoria (prévia e PDF). */
export function intervencoesParaRelatorio(lista: IntervencaoIA[] | undefined) {
  return PRIORIDADES.map((p) => {
    const itens = (lista ?? []).filter((i) => i.prioridade === p.id);
    const categorias: { categoria: string; itens: IntervencaoIA[] }[] = [];
    for (const i of itens) {
      const g = categorias.find((c) => c.categoria === i.categoria);
      if (g) g.itens.push(i);
      else categorias.push({ categoria: i.categoria, itens: [i] });
    }
    return { ...p, categorias };
  }).filter((g) => g.categorias.length > 0);
}
