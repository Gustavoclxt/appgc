import type { Assessment, IndicadorAntropometrico } from "./types";
import { parseNumero } from "./calculations";

const normalizar = (nome: string) => nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim();

const categorias = ["Medidas", "Circunferências", "Dobras cutâneas", "Resultados", "Outros indicadores"] as const;
export type CategoriaAntropometrica = typeof categorias[number];

export function categoriaAntropometrica(i: Pick<IndicadorAntropometrico, "nome" | "unidade">): CategoriaAntropometrica {
  const n = normalizar(i.nome);
  if (/\b(imc|massa|gordura|soma|somatorio|somatoria|razao|relacao|rcq|amb|agb|area|percentual)\b/.test(n) || n.includes("%")) return "Resultados";
  if (/\b(altura|estatura|peso)\b/.test(n)) return "Medidas";
  if (/\b(circunferencia|perimetro)\b/.test(n)) return "Circunferências";
  if (/\bdobras?\b/.test(n) || normalizar(i.unidade) === "mm") return "Dobras cutâneas";
  // A mesma região pode aparecer em ambos os grupos; dobras são sempre em mm, então "cm" indica circunferência.
  if (/\b(biceps|triceps|axilar|torax|medial|abdominal|suprailiaca|subescapular)\b/.test(n) && normalizar(i.unidade) !== "cm") return "Dobras cutâneas";
  if (/\b(circunferencia|perimetro|ombro|ombros|cintura|quadril|coxa|panturrilha|braco|peitoral|abdomen)\b/.test(n)) return "Circunferências";
  return "Outros indicadores";
}

/** Rótulo curto para exibição: abrevia "Dobra(s) cutânea(s)" para "DC" (ex.: "DC Abdominal"); o valor guardado permanece original. */
export function rotuloIndicador(nome: string, categoria?: CategoriaAntropometrica): string {
  let abreviado = nome.trim().replace(/dobras?\s+cut[âa]ne[oa]s?/gi, "DC");
  // Imported PDFs often contain only the body site, without the skinfold prefix.
  if (categoria === "Dobras cutâneas" && !/^DC\b/i.test(abreviado)) abreviado = `DC ${abreviado}`;
  return abreviado.replace(/^(DC)(\s*)(\p{L})/u, (_, dc, espaco, letra) => `${dc}${espaco}${letra.toUpperCase()}`);
}

/** Round only the displayed measurement, preserving the original imported value.
 *  Medidas (altura/peso) keep two decimals; every other group shows one. */
export function valorComUnidade(i: Pick<IndicadorAntropometrico, "valor" | "unidade">, categoria?: CategoriaAntropometrica): string {
  const original = i.valor.trim();
  const partes = original.match(/^([+-]?\d+(?:[.,]\d+)?)\s*([^\d.,].*)?$/u);
  const numero = parseNumero(partes?.[1] ?? original);
  const casas = categoria === "Medidas" ? 2 : 1;
  const valor = numero === null ? original : numero.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas, useGrouping: false });
  const unidade = i.unidade.trim() || partes?.[2]?.trim() || "";
  if (!valor) return unidade || "—";
  if (!unidade) return valor;
  return unidade.startsWith("%") ? `${valor}${unidade}` : `${valor} ${unidade}`;
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

/** As observações sobre os exames só existem enquanto o box de exames é exibido. */
export const observacoesExamesParaRelatorio = (a: Pick<Assessment, "possuiExames" | "observacoesExames">) =>
  podeAnexarExames(a) ? a.observacoesExames : "";

/** Prefer the latest measured weight; never substitute the referred or target weight. */
export function pesoAntropometricoParaResumo(a: Pick<Assessment, "indicadoresAntropometricos" | "dataAvaliacaoAntropometrica" | "peso">): number | null {
  const pesos = a.indicadoresAntropometricos.flatMap((i) => {
    if (!/^(peso|peso atual|peso corporal|peso total|peso corporal atual)$/.test(normalizar(i.nome))) return [];
    const unidade = normalizar(i.unidade);
    if (unidade && unidade !== "kg" && unidade !== "g") return [];
    const valor = parseNumero(i.valor.replace(/\s*(kg|g)\s*$/i, ""));
    if (valor === null || valor <= 0) return [];
    const kg = unidade === "g" || /\s g\s*$/i.test(i.valor) ? valor / 1000 : valor;
    const data = Date.parse(i.data || a.dataAvaliacaoAntropometrica);
    return [{ kg, data: Number.isFinite(data) ? data : 0 }];
  });
  pesos.sort((a, b) => b.data - a.data);
  return pesos[0]?.kg ?? parseNumero(a.peso);
}