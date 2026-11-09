import { describe, expect, it } from "vitest";

import type { ExameLaboratorial } from "./types";
import { datasDosExames, metaExamesIdentificados } from "./exam-dates";

const exame = (exame: string, data?: string): ExameLaboratorial => ({
  id: exame,
  exame,
  resultado: "1",
  unidade: "",
  referencia: "",
  status: "dentro",
  ...(data === undefined ? {} : { data }),
});

describe("datas dos exames no cabeçalho", () => {
  it("reúne as datas distintas em ordem cronológica", () => {
    const exames = [
      exame("Hemoglobina", "24/03/2026"),
      exame("Ferritina", "24/03/2026"),
      exame("Glicose", "05/01/2026"),
      exame("Cortisol", "12/02/2026"),
    ];
    expect(datasDosExames(exames)).toEqual(["05/01/2026", "12/02/2026", "24/03/2026"]);
  });

  it("mostra a contagem seguida da data no cabeçalho", () => {
    const exames = Array.from({ length: 55 }, (_, i) => exame(`Exame ${i}`, "24/03/2026"));
    expect(metaExamesIdentificados(exames)).toBe("55 resultado(s) · 24/03/2026");
  });

  it("mantém apenas a contagem quando nenhuma data foi informada", () => {
    expect(metaExamesIdentificados([exame("Hemoglobina"), exame("Glicose", "   ")])).toBe(
      "2 resultado(s)",
    );
  });

  it("separa as datas quando há mais de uma", () => {
    const exames = [exame("Glicose", "05/01/2026"), exame("Hemoglobina", "24/03/2026")];
    expect(metaExamesIdentificados(exames)).toBe("2 resultado(s) · 05/01/2026 · 24/03/2026");
  });
});
