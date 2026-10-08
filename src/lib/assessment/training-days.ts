export const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

/** Global selections are exclusive, but never block switching to individual days. */
export function selecionarDias(atual: string, valores: string[], global: "Todos" | "Nenhum"): string {
  if (atual !== global && valores.includes(global)) return global;
  return DIAS_SEMANA.filter((dia) => valores.includes(dia)).join(", ");
}