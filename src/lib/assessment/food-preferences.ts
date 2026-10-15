import type { Assessment } from "./types";

export const vegetais = [
  "Alface", "Rúcula", "Agrião", "Couve", "Espinafre", "Acelga", "Repolho", "Couve-flor",
  "Brócolis", "Abobrinha", "Berinjela", "Pepino", "Tomate", "Cenoura", "Beterraba", "Chuchu",
  "Vagem", "Abóbora", "Nenhuma", "Todos",
];
export const proteinas = ["Bovina", "Frango", "Peixe", "Suína", "Ovos", "Vísceras", "Nenhuma", "Todas"];
export const carboidratos = ["Arroz", "Macarrão", "Batata", "Batata-doce", "Mandioca", "Pão", "Torrada", "Tapioca", "Cuscuz", "Rap10", "Nenhuma", "Todos"];
export const frutas = [
  "Mamão", "Melão", "Morango", "Melancia", "Pêssego", "Laranja", "Mexerica", "Abacaxi",
  "Uva", "Kiwi", "Manga", "Pera", "Ameixa", "Goiaba", "Maçã", "Maracujá", "Banana", "Caqui",
  "Nenhuma", "Todas",
];
export const leguminosas = ["Feijão", "Lentilha", "Ervilha", "Soja", "Grão de bico", "Nenhum", "Todas"];
export const lacteos = ["Leite", "Iogurte", "Queijo", "Requeijão", "Nenhum", "Todos"];
export const cereais = ["Aveia", "Quinoa", "Linhaça", "Chia", "Granola", "Nenhum", "Todos"];
export const gorduras = ["Margarina", "Manteiga", "Banha", "Oleaginosas", "Azeite de Oliva", "Nenhum", "Todas"];
export const doces = ["Doce de Leite", "Geleia", "Pasta de Amendoim", "Sucrilhos", "Biscoitos", "Chocolate", "Bala", "Chicletes", "Guloseimas", "Nenhum", "Todos"];
export const cafeCha = ["Café puro", "Café com leite", "Chá", "Refri Normal", "Refri Zero", "Suco Natural", "Suco Artificial", "H2OH", "Água c/gás", "Chimarrão", "Nenhum", "Todas"];

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

/**
 * Aplica uma seleção das listas de preferência, vindo de clique simples ou de
 * intervalo com Shift, preservando as regras de “Nenhum(a)”/“Todos(as)”.
 * `novos` é a seleção proposta e `alvo` o botão efetivamente clicado.
 */
export function aplicarSelecaoPreferencia(
  atuais: string[],
  novos: string[],
  opcoes: string[],
  alvo?: string,
): string[] {
  const ehNenhum = (v: string) => v === "Nenhum" || v === "Nenhuma";
  const ehTodos = (v: string) => v === "Todos" || v === "Todas";
  const selecionaveis = opcoes.filter((item) => !ehNenhum(item));
  const adicionados = novos.filter((item) => !atuais.includes(item));
  const removidos = atuais.filter((item) => !novos.includes(item));
  if (!adicionados.length && !removidos.length) return atuais;
  if (alvo && GLOBAIS.includes(alvo)) {
    if (adicionados.includes(alvo)) return ehNenhum(alvo) ? [alvo] : selecionaveis;
    if (removidos.includes(alvo)) return [];
  }
  if (adicionados.some((item) => ehTodos(item))) return selecionaveis;
  const nenhumAdicionado = adicionados.find(ehNenhum);
  if (nenhumAdicionado) return [nenhumAdicionado];
  const base = atuais.filter((item) => !GLOBAIS.includes(item));
  for (const item of adicionados) if (!base.includes(item) && opcoes.includes(item)) base.push(item);
  return base.filter((item) => !removidos.includes(item));
}

/** Alimentos das listas de preferência que o paciente não marcou. Grupos sem resposta são ignorados. */
export function alimentosNaoConsumidos(a: Assessment): string[] {
  const grupos: [string[], string[]][] = [
    [a.prefCarboidratos, carboidratos],
    [a.prefProteinas, proteinas],
    [a.prefGorduras, gorduras],
    [a.prefVegetais, vegetais],
    [a.prefFrutas, frutas],
    [a.prefLeguminosas, leguminosas],
    [a.prefCereais, cereais],
    [a.prefLacteos, lacteos],
    [a.prefCafeCha, cafeCha],
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
    ["Carboidratos", a.prefCarboidratos, carboidratos],
    ["Proteínas", a.prefProteinas, proteinas],
    ["Gorduras", a.prefGorduras, gorduras],
    ["Vegetais/Saladas", a.prefVegetais, vegetais],
    ["Frutas", a.prefFrutas, frutas],
    ["Leguminosas", a.prefLeguminosas, leguminosas],
    ["Cereais e Grãos", a.prefCereais, cereais],
    ["Lácteos", a.prefLacteos, lacteos],
    ["Doces", a.prefDoces, doces],
    ["Bebidas", a.prefCafeCha, cafeCha],
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
