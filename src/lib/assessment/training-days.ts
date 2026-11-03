export const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

/**
 * "Todos" seleciona de fato todos os dias da semana (estado = todos os dias).
 * "Nenhum" permanece exclusivo, mas nunca bloqueia a troca para dias individuais.
 */
export function selecionarDias(atual: string, valores: string[], global: "Todos" | "Nenhum"): string {
  if (valores.includes(global)) {
    if (global === "Todos") return DIAS_SEMANA.join(", ");
    if (atual !== global) return global;
  }
  return DIAS_SEMANA.filter((dia) => valores.includes(dia)).join(", ");
}
