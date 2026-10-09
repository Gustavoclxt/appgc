import { describe, expect, it } from "vitest";

import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { anamneseParaRelatorio } from "./report-anamnesis";

function suplementosDoRelatorio(observacoes: string) {
  const a = createEmptyAssessment();
  a.usaSuplemento = "sim";
  a.suplementos = [
    { id: "1", nome: "Creatina", dose: "5", horario: "07:00", frequencia: "Diária", observacoes },
  ];
  const secoes = anamneseParaRelatorio(a, deriveResults(a));
  return secoes.flatMap((s) => s.fields).find((f) => f.label === "Suplementos")?.value;
}

describe("observações de suplemento no relatório", () => {
  it("anexa a observação preenchida ao item do suplemento", () => {
    expect(suplementosDoRelatorio("Uso com água")).toBe(
      "Creatina · 5 · 07:00 · Diária · Obs: Uso com água",
    );
  });

  it("mantém o item sem observação quando o campo fica vazio", () => {
    expect(suplementosDoRelatorio("   ")).toBe("Creatina · 5 · 07:00 · Diária");
  });
});
