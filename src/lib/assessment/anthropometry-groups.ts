import type { Assessment, IndicadorAntropometrico } from "./types";

const normalizar = (nome: string) => nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();

const categorias = ["Medidas", "Circunferências", "Dobras cutâneas", "Resultados", "Outros indicadores"] as const;
export type CategoriaAntropometrica = typeof categorias[number];

export function categoriaAntropometrica(i: Pick<IndicadorAntropometrico, "nome" | "unidade">): CategoriaAntropometrica {
  const n = normalizar(i.nome);
  if (/\b(imc|massa|gordura|soma|somatorio|somatoria|razao|relacao|rcq|amb|agb|area|percentual)\b/.test(n) || n.includes("%")) return "Resultados";
  if (/\b(altura|estatura|peso)\b/.test(n)) return "Medidas";
  if (/\b(dobra|dobras|biceps|triceps|axilar|torax|medial|abdominal|suprailiaca|subescapular)\b/.test(n) || normalizar(i.unidade) === "mm") return "Dobras cutâneas";
  if (/\b(circunferencia|perimetro|ombro|ombros|cintura|quadril|coxa|panturrilha|braco|peitoral|abdomen)\b/.test(n)) return "Circunferências";
  return "Outros indicadores";
}

/** Preserve every original row and date; unknown indicators are never discarded. */
export function agruparAntropometria(indicadores: IndicadorAntropometrico[], dataAvaliacao: string) {
  return categorias.flatMap(categoria => {
    const itens = indicadores.filter(i => categoriaAntropometrica(i) === categoria);
    const datas = [...new Set(itens.map(i => i.data.trim() || dataAvaliacao))];
    return datas.map(data => ({ categoria, data, indicadores: itens.filter(i => (i.data.trim() || dataAvaliacao) === data) }));
  });
}

export const podeAnexarExames = (a: Pick<Assessment, "possuiExames">) => a.possuiExames === "sim";