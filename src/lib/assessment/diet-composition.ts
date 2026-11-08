import type { Refeicao } from "./types";

export interface ItemComposicao {
  refeicao: string;
  alimento: string;
  quantidade: string;
  kcal: number;
  carboidratos: number;
  proteinas: number;
  lipidios: number;
  fonte: string;
}

export interface ComposicaoDiario {
  chave: string;
  itens: ItemComposicao[];
  totais: { kcal: number; carboidratos: number; proteinas: number; lipidios: number };
}

/** Lista de alimentos do diário usada no cálculo (e para saber se o cálculo está desatualizado). */
export function alimentosDoDiario(refeicoes: Refeicao[]) {
  return refeicoes.flatMap((r) =>
    r.alimentos
      .filter((i) => i.alimento.trim())
      .map((i) => ({ refeicao: r.refeicao || "Refeição", alimento: i.alimento.trim(), quantidade: i.quantidade.trim() })),
  );
}

export function chaveDiario(refeicoes: Refeicao[]) {
  return JSON.stringify(alimentosDoDiario(refeicoes));
}

/** Calculates only the supplied day, capturing its key before the asynchronous request. */
export async function calcularComposicaoDasRefeicoes(
  refeicoes: Refeicao[],
  calcular: (itens: ReturnType<typeof alimentosDoDiario>) => Promise<ItemComposicao[]>,
): Promise<ComposicaoDiario> {
  const itens = alimentosDoDiario(refeicoes);
  if (!itens.length) throw new Error("Adicione alimentos antes de calcular.");
  const chave = chaveDiario(refeicoes);
  const resultado = await calcular(itens);
  return { chave, itens: resultado, totais: somarTotais(resultado) };
}

/** Session cache so the same food + quantity always returns the same composition. */
export type CacheComposicao = Map<string, Omit<ItemComposicao, keyof ReturnType<typeof alimentosDoDiario>[number]>>;

const chaveItem = (i: { alimento: string; quantidade: string }) =>
  `${i.alimento.trim().toLowerCase().replace(/\s+/g, " ")}|${i.quantidade.trim().toLowerCase().replace(/\s+/g, " ")}`;

export function comCacheDeComposicao(
  cache: CacheComposicao,
  calcular: (itens: ReturnType<typeof alimentosDoDiario>) => Promise<ItemComposicao[]>,
) {
  return async (itens: ReturnType<typeof alimentosDoDiario>): Promise<ItemComposicao[]> => {
    const pendentes = itens.filter(i => !cache.has(chaveItem(i)));
    const unicos = pendentes.filter((i, n) => pendentes.findIndex(p => chaveItem(p) === chaveItem(i)) === n);
    if (unicos.length) {
      const calculados = await calcular(unicos);
      calculados.forEach((c, n) => {
        const origem = unicos[n];
        if (!origem) return;
        const { kcal, carboidratos, proteinas, lipidios, fonte } = c;
        cache.set(chaveItem(origem), { kcal, carboidratos, proteinas, lipidios, fonte } as never);
      });
    }
    return itens.map(i => ({ ...i, ...(cache.get(chaveItem(i)) ?? { kcal: 0, carboidratos: 0, proteinas: 0, lipidios: 0, fonte: "" }) }) as ItemComposicao);
  };
}

export function somarTotais(itens: ItemComposicao[]) {
  return itens.reduce(
    (t, i) => ({
      kcal: t.kcal + i.kcal,
      carboidratos: t.carboidratos + i.carboidratos,
      proteinas: t.proteinas + i.proteinas,
      lipidios: t.lipidios + i.lipidios,
    }),
    { kcal: 0, carboidratos: 0, proteinas: 0, lipidios: 0 },
  );
}

/** Agrupa os itens calculados por refeição, na ordem do diário, com o horário de cada refeição. */
export function agruparItensPorRefeicao(itens: ItemComposicao[], refeicoes: Refeicao[]) {
  const horarios = new Map(
    refeicoes.map((r) => [r.refeicao.trim().toLocaleLowerCase("pt-BR") || "refeição", r.horario]),
  );
  const grupos: { nome: string; horario: string; kcal: number; itens: ItemComposicao[] }[] = [];
  for (const i of itens) {
    const chave = i.refeicao.trim().toLocaleLowerCase("pt-BR") || "refeição";
    const atual = grupos[grupos.length - 1];
    if (atual && atual.nome.toLocaleLowerCase("pt-BR") === chave) {
      atual.itens.push(i);
      atual.kcal += i.kcal;
    } else {
      grupos.push({ nome: i.refeicao || "Refeição", horario: horarios.get(chave) ?? "", kcal: i.kcal, itens: [i] });
    }
  }
  return grupos;
}

/** Linhas de texto padronizadas (prévia, PDF e cópia). */
export function composicaoParaRelatorio(c: ComposicaoDiario | null) {
  if (!c || !c.itens.length) return null;
  const t = c.totais;
  const kcalMacro = t.carboidratos * 4 + t.proteinas * 4 + t.lipidios * 9 || 1;
  const pct = (g: number, f: number) => Math.round(((g * f) / kcalMacro) * 100);
  const g = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return {
    totais: [
      { label: "Calorias totais", valor: `${Math.round(t.kcal).toLocaleString("pt-BR")} kcal` },
      { label: "Carboidratos", valor: `${g(t.carboidratos)} g (${pct(t.carboidratos, 4)}%)` },
      { label: "Proteínas", valor: `${g(t.proteinas)} g (${pct(t.proteinas, 4)}%)` },
      { label: "Lipídios", valor: `${g(t.lipidios)} g (${pct(t.lipidios, 9)}%)` },
    ],
    itens: c.itens.map((i) => ({
      texto: [i.alimento, i.quantidade].filter(Boolean).join(" — "),
      valores: `${Math.round(i.kcal)} kcal · CHO ${g(i.carboidratos)} g · PTN ${g(i.proteinas)} g · LIP ${g(i.lipidios)} g`,
      fonte: i.fonte,
    })),
  };
}
