import type { Assessment } from "./types";

export const vegetais = [
  "Alface", "Rúcula", "Agrião", "Couve", "Espinafre", "Acelga", "Repolho", "Couve-flor",
  "Brócolis", "Abobrinha", "Berinjela", "Pepino", "Tomate", "Cenoura", "Beterraba", "Chuchu",
  "Vagem", "Abóbora", "Nenhum", "Todos",
];
export const proteinas = ["Bovina", "Frango", "Peixe", "Suína", "Ovos", "Vísceras", "Nenhuma", "Todas"];
export const carboidratos = ["Arroz", "Macarrão", "Batata", "Batata-doce", "Mandioca", "Pão", "Torrada", "Tapioca", "Cuscuz", "Rap10", "Nenhum", "Todos"];
export const frutas = [
  "Mamão", "Melão", "Morango", "Melancia", "Pêssego", "Laranja", "Mexerica", "Abacaxi",
  "Uva", "Kiwi", "Manga", "Pera", "Ameixa", "Goiaba", "Maçã", "Maracujá", "Banana", "Caqui",
  "Nenhuma", "Todas",
];
export const lacteos = ["Leite", "Iogurte", "Queijo", "Requeijão", "Nenhum", "Todos"];
export const cereais = ["Aveia", "Quinoa", "Linhaça", "Chia", "Nenhum", "Todos"];
export const gorduras = ["Margarina", "Manteiga", "Banha", "Oleaginosas", "Nenhum", "Todas"];
export const doces = ["Doce de Leite", "Geleia", "Pasta de Amendoim", "Sucrilhos", "Biscoitos", "Chocolate", "Bala", "Chicletes", "Guloseimas", "Nenhum", "Todos"];
export const cafeCha = ["Café", "Chá", "Nenhum"];

const GLOBAIS = ["Nenhum", "Nenhuma", "Todos", "Todas"];
const nomeProteina: Record<string, string> = {
  Bovina: "carne bovina",
  Suína: "carne suína",
  Frango: "frango",
  Peixe: "peixe",
};

/** Resume uma seleção completa como “Todos” ou “Todas” nos relatórios. */
export function formatarPreferencia(
  selecionados: string[],
  opcoes: string[],
  global: "Todos" | "Todas",
) {
  const itens = opcoes.filter((item) => !GLOBAIS.includes(item));
  return itens.length > 0 && itens.every((item) => selecionados.includes(item))
    ? global
    : selecionados.join(", ");
}

/** Alimentos das listas de preferência que o paciente não marcou. Grupos sem resposta são ignorados. */
export function alimentosNaoConsumidos(a: Assessment): string[] {
  const grupos: [string[], string[]][] = [
    [a.prefVegetais, vegetais],
    [a.prefFrutas, frutas],
    [a.prefLacteos, lacteos],
    [a.prefCafeCha, cafeCha],
    [a.prefProteinas, proteinas],
    [a.prefCarboidratos, carboidratos],
    [a.prefCereais, cereais],
    [a.prefGorduras, gorduras],
    [a.prefDoces, doces],
  ];
  const fora: string[] = [];
  for (const [sel, opcoes] of grupos) {
    if (!sel.length || sel.includes("Todos") || sel.includes("Todas")) continue;
    for (const o of opcoes) {
      if (GLOBAIS.includes(o) || sel.includes(o)) continue;
      fora.push((nomeProteina[o] ?? o).toLowerCase());
    }
  }

  if (a.alergia === "sim" && a.alergiaDescricao.trim()) fora.push(a.alergiaDescricao.trim().toLowerCase());
  if (a.aversoes.trim()) fora.push(a.aversoes.trim().toLowerCase());

  if (a.restricaoAlimentar === "vegetariano" || a.restricaoAlimentar === "vegano") {
    fora.push("carne bovina", "frango", "peixe", "carne suína", "vísceras");
  }
  if (a.restricaoAlimentar === "vegano") {
    fora.push("ovos", "leite", "iogurte", "queijo", "requeijão");
  }

  return [...new Set(fora.map((item) => item.trim()).filter(Boolean))];
}

export function fraseAlimentosRetirar(a: Assessment): string {
  const itens = alimentosNaoConsumidos(a);
  if (!itens.length) return "";
  const lista = itens.length === 1 ? itens[0] : `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
  return `Retirar ${lista} da dieta.`;
}

export interface GrupoRetirar { grupo: string; itens: string[] }

/** Alimentos a retirar agrupados pelo grupo alimentar de origem. */
export function alimentosRetirarPorGrupo(a: Assessment): GrupoRetirar[] {
  const grupos: [string, string[], string[]][] = [
    ["Vegetais/Saladas", a.prefVegetais, vegetais],
    ["Frutas", a.prefFrutas, frutas],
    ["Lácteos", a.prefLacteos, lacteos],
    ["Café/Chá", a.prefCafeCha, cafeCha],
    ["Proteínas", a.prefProteinas, proteinas],
    ["Carboidratos", a.prefCarboidratos, carboidratos],
    ["Cereais e Grãos", a.prefCereais, cereais],
    ["Gorduras", a.prefGorduras, gorduras],
    ["Doces", a.prefDoces, doces],
  ];
  const mapa = new Map<string, string[]>();
  const add = (g: string, item: string) => {
    const v = item.trim().toLowerCase();
    if (!v) return;
    const l = mapa.get(g) ?? [];
    if (!l.includes(v)) l.push(v);
    mapa.set(g, l);
  };
  for (const [g, sel, opcoes] of grupos) {
    if (!sel.length || sel.includes("Todos") || sel.includes("Todas")) continue;
    for (const o of opcoes) if (!GLOBAIS.includes(o) && !sel.includes(o)) add(g, nomeProteina[o] ?? o);
  }
  if (a.restricaoAlimentar === "vegetariano" || a.restricaoAlimentar === "vegano") {
    for (const x of ["carne bovina", "frango", "peixe", "carne suína", "vísceras"]) add("Proteínas", x);
  }
  if (a.restricaoAlimentar === "vegano") {
    add("Proteínas", "ovos");
    for (const x of ["leite", "iogurte", "queijo", "requeijão"]) add("Lácteos", x);
  }
  if (a.alergia === "sim" && a.alergiaDescricao.trim()) add("Alergias/intolerâncias", a.alergiaDescricao);
  if (a.aversoes.trim()) add("Aversões alimentares", a.aversoes);
  const ordem = [...grupos.map((g) => g[0]), "Alergias/intolerâncias", "Aversões alimentares"];
  return ordem.filter((g) => mapa.get(g)?.length).map((g) => ({ grupo: g, itens: mapa.get(g)! }));
}

export function linhasAlimentosRetirar(a: Assessment): string[] {
  return alimentosRetirarPorGrupo(a).map((g) => `${g.grupo}: ${g.itens.join(", ")}`);
}

export function comObs(valor: string, obs?: string): string {
  const o = obs?.trim();
  if (!o) return valor;
  return valor ? `${valor} · Obs.: ${o}` : `Obs.: ${o}`;
}
