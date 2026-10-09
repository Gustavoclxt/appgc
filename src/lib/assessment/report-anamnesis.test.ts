import { describe, expect, it } from "vitest";

import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { buildResumo } from "./summary";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { alimentosNaoConsumidos } from "./food-preferences";

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

  it("leva a observação ao resumo enviado para a análise", () => {
    const a = createEmptyAssessment();
    a.usaSuplemento = "sim";
    a.suplementos = [
      { id: "1", nome: "Creatina", dose: "5", horario: "07:00", frequencia: "Diária", observacoes: "Uso com água" },
    ];
    expect(buildResumo(a, deriveResults(a))).toContain("Suplementos: Creatina 5 07:00 Diária Obs: Uso com água");
  });
});

describe("granola e azeite de oliva nas preferências", () => {
  it("entram na lista de alimentos a retirar quando não marcados", () => {
    const a = createEmptyAssessment();
    a.prefCereais = ["Aveia"];
    a.prefGorduras = ["Manteiga"];
    const fora = alimentosNaoConsumidos(a);
    expect(fora).toContain("granola");
    expect(fora).toContain("azeite de oliva");
  });

  it("saem da lista de retirada quando o grupo inteiro é marcado", () => {
    const a = createEmptyAssessment();
    a.prefCereais = ["Todos"];
    a.prefGorduras = ["Todas"];
    const fora = alimentosNaoConsumidos(a);
    expect(fora).not.toContain("granola");
    expect(fora).not.toContain("azeite de oliva");
  });
});
