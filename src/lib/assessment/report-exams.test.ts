import { describe, expect, it } from "vitest";
import { examesParaRelatorio } from "./report-exams";
import type { ExameLaboratorial } from "./types";
const ex = (exame: string): ExameLaboratorial => ({ id: exame, exame, resultado: "1", unidade: "", referencia: "", status: "dentro" });
describe("exames sempre incluídos", () => {
  it("inclui Ferro, Ferritina, Vitamina D (25-Hidroxivitamina D) e B12 mesmo normais", () => {
    const r = examesParaRelatorio([ex("Ferro sérico"), ex("Ferritina"), ex("25-Hidroxivitamina D"), ex("Vitamina B12"), ex("Glicose")]);
    expect(r.map((e: { exame: string }) => e.exame)).toEqual(["Ferro sérico", "Ferritina", "25-Hidroxivitamina D", "Vitamina B12"]);
  });
  it.each([
    "Vitamina B12",
    "Vitamina B-12",
    "Metilcobalamina",
    "Vitamina B12, soro",
    "Cianocobalamina",
    "Concentração de vitamina B12",
  ])("inclui %s mesmo dentro da referência, preservando o resultado original", (nome) => {
    const exame = { ...ex(nome), resultado: "450", unidade: "pg/mL", referencia: "200 a 900" };
    expect(examesParaRelatorio([exame, ex("Glicose")])).toEqual([exame]);
  });
});
