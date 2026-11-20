import { ETAPAS } from "./initial-state";

/** The report step starts remote analysis automatically, so browser agents cannot open it. */
export function validarEtapaAgente(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 4) {
    throw new Error("Etapa inválida; escolha 1 (Dados), 2 (Rotina), 3 (Avaliação) ou 4 (Energia). Relatórios exigem navegação manual.");
  }
  return value;
}

export function resumoEtapaAgente(etapa: number): string {
  const atual = ETAPAS.find(item => item.id === etapa);
  return `Etapa atual: ${atual?.nomeCompleto ?? "Não identificada"}.\n${ETAPAS.map(item => `${item.id}: ${item.nomeCompleto}`).join("\n")}\nDados clínicos permanecem na sessão. Relatórios devem ser abertos manualmente.`;
}