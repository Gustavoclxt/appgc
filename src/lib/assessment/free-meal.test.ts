import { describe, expect, it } from "vitest";
import { calcularVetCorrigido } from "./free-meal";
describe("VET corrigido", () => {
  it("reproduz o exemplo: 2000 kcal, 1 refeição livre de 1600 kcal", () => {
    expect(calcularVetCorrigido(2000, 1, 1600)).toBeCloseTo(1771.43, 2);
  });
  it("sem VET não calcula", () => {
    expect(calcularVetCorrigido(null, 1, 1600)).toBeNull();
  });
});
