import { describe, expect, it } from "vitest";
import { validarEtapaAgente } from "./agent-navigation";

describe("navegação dos agentes sem envio clínico", () => {
  it("permite somente as quatro etapas sem análise automática", () => {
    for (const etapa of [1, 2, 3, 4]) expect(validarEtapaAgente(etapa)).toBe(etapa);
  });
  it("bloqueia o relatório que inicia análise remota", () => {
    expect(() => validarEtapaAgente(5)).toThrow("Relatórios exigem navegação manual");
  });
  it("rejeita entradas inválidas sem coerção", () => {
    for (const value of [0, 6, 1.5, "1", null, undefined, NaN, Infinity]) {
      expect(() => validarEtapaAgente(value)).toThrow("Etapa inválida");
    }
  });
});