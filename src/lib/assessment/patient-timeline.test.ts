import { describe, expect, it } from "vitest";
import { createExampleAssessment } from "./example-patient";
import { deriveResults } from "./calculations";
import { calcularMetasPeso } from "./weight-goals";
import { metasPesoIniciais } from "./weight-projection";
import { linhaDoTempoPaciente } from "./patient-timeline";

describe("linhaDoTempoPaciente", () => {
  it("começa no dia da consulta e para ao atingir o peso desejado", () => {
    const a = { ...createExampleAssessment(), objetivos: ["Emagrecimento"] };
    const d = deriveResults(a);
    const peso = d.pesoKg!;
    const m = calcularMetasPeso(a, d, { ...metasPesoIniciais(), pesoDesejado: String(peso - 3), deficitKcal: "500" });
    const t = linhaDoTempoPaciente(a, d, m);
    expect(t[0]!.rotulo).toBe("Hoje");
    expect(t[0]!.peso).toBe(peso);
    expect(t.at(-1)!.metaAtingida).toBe(true);
    expect(t.at(-1)!.peso).toBeLessThanOrEqual(peso - 3);
  });
  it("sem peso desejado mostra todos os intervalos da calculadora", () => {
    const a = { ...createExampleAssessment(), objetivos: ["Emagrecimento"], pesoDesejado: "" };
    const d = deriveResults(a);
    const m = calcularMetasPeso(a, d, { ...metasPesoIniciais(), deficitKcal: "500" });
    expect(linhaDoTempoPaciente(a, d, m).length).toBe(1 + m.projecoes.length);
  });
});
