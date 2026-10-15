import { describe, expect, it } from "vitest";
import { examesParaRelatorio } from "./report-exams";
const ex = (exame: string) => ({ id: exame, exame, valor: "1", unidade: "", referencia: "", status: "normal" }) as never;
describe("exames sempre incluídos", () => {
  it("inclui Ferro, Ferritina, Vitamina D (25-Hidroxivitamina D) e B12 mesmo normais", () => {
    const r = examesParaRelatorio([ex("Ferro sérico"), ex("Ferritina"), ex("25-Hidroxivitamina D"), ex("Vitamina B12"), ex("Glicose")]);
    expect(r.map((e: { exame: string }) => e.exame)).toEqual(["Ferro sérico", "Ferritina", "25-Hidroxivitamina D", "Vitamina B12"]);
  });
});
