import type { Assessment } from "./types";

export const vegetais = [
  "Alface", "Rúcula", "Agrião", "Couve", "Espinafre", "Acelga", "Repolho", "Couve-flor",
  "Brócolis", "Abobrinha", "Berinjela", "Pepino", "Tomate", "Cenoura", "Beterraba", "Chuchu",
  "Vagem", "Quiabo", "Pimentão", "Rabanete", "Nabo", "Abóbora", "Nenhum", "Todos",
];
export const proteinas = ["Bovina", "Frango", "Peixe", "Suína", "Ovos", "Vísceras", "Nenhuma", "Todas"];
export const carboidratos = ["Arroz", "Macarrão", "Batata", "Batata-doce", "Mandioca", "Pão", "Tapioca", "Cuscuz", "Nenhum", "Todos"];
export const frutas = [
  "Mamão", "Melão", "Morango", "Melancia", "Pêssego", "Laranja", "Mexerica", "Abacaxi",
  "Uva", "Kiwi", "Manga", "Pera", "Ameixa", "Goiaba", "Maçã", "Maracujá", "Banana", "Caqui",
  "Nenhuma", "Todas",
];
export const lacteos = ["Leite", "Iogurte", "Queijo", "Requeijão", "Nenhum", "Todos"];
export const cereais = ["Aveia", "Quinoa", "Amaranto", "Linhaça", "Chia", "Gergelim", "Nenhum", "Todos"];
export const gorduras = ["Margarina", "Manteiga", "Banha", "Oleaginosas", "Nenhum"];
export const doces = ["Doce de Leite", "Geleia", "Pasta de Amendoim", "Sucrilhos", "Biscoitos", "Chocolate", "Bala", "Nenhum", "Todos"];
export const cafeCha = ["Café", "Chá", "Nenhum"];

const GLOBAIS = ["Nenhum", "Nenhuma", "Todos", "Todas"];
const nomeProteina: Record<string, string> = {
  Bovina: "carne bovina",
  Suína: "carne suína",
  Frango: "frango",
  Peixe: "peixe",
};

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
