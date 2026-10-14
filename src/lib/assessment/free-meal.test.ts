import { describe, expect, it } from "vitest";
import { calcularVetCorrigido, resumoVetFinal } from "./free-meal";

describe("VET corrigido", () => {
  it("reproduz o exemplo: 2000 kcal, 1 refeição livre de 1600 kcal", () => {
    expect(calcularVetCorrigido(2000, 1, 1600)).toBeCloseTo(1771.43, 2);
  });
  it("sem VET não calcula", () => {
    expect(calcularVetCorrigido(null, 1, 1600)).toBeNull();
  });
});

describe("resumoVetFinal", () => {
  it("mostra quantidade, VET da refeição livre e VET final", () => {
    const r = resumoVetFinal(2000, "1", "1600");
    expect(r).not.toBeNull();
    expect(r?.quantidade).toBe("1 refeição/semana");
    expect(r?.vetRefeicao).toBe("1.600 kcal");
    expect(r?.vetFinal).not.toBeNull();
    expect(r?.vetFinal).toBeCloseTo(1771.43, 2);
  });

  it("duas refeições livres de 1600 kcal saem da soma semanal", () => {
    const r = resumoVetFinal(2000, "2", "1600");
    expect(r?.quantidade).toBe("2 refeições/semana");
    // (2000×7 − 2×1600) ÷ 7 = 1542,86…
    expect(r?.vetFinal).toBeCloseTo(1542.86, 2);
  });

  it("retorna null sem nenhum campo preenchido", () => {
    expect(resumoVetFinal(2000, "", "")).toBeNull();
  });

  it("com apenas um campo preenchido, VET final fica nulo e campos mostram —", () => {
    const r = resumoVetFinal(2000, "1", "");
    expect(r).not.toBeNull();
    expect(r?.vetRefeicao).toBe("—");
    expect(r?.vetFinal).toBeNull();
  });
});
