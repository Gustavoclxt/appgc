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

describe("grupo Bebidas", () => {
  it("aparece como Bebidas no relatório, com as opções marcadas", () => {
    const a = createEmptyAssessment();
    a.prefCafeCha = ["Café", "Suco Natural"];
    const secoes = anamneseParaRelatorio(a, deriveResults(a));
    const campo = secoes.flatMap((s) => s.fields).find((f) => f.label === "Bebidas");
    expect(campo?.value).toBe("Café, Suco Natural");
    expect(secoes.flatMap((s) => s.fields).some((f) => f.label === "Café/chá")).toBe(false);
  });

  it("lista as bebidas não marcadas entre os itens a retirar", () => {
    const a = createEmptyAssessment();
    a.prefCafeCha = ["Café"];
    const fora = alimentosNaoConsumidos(a);
    expect(fora).toContain("refri normal");
    expect(fora).toContain("refri zero");
    expect(fora).toContain("suco natural");
    expect(fora).toContain("suco artificial");
    expect(fora).toContain("h2oh");
    expect(fora).toContain("água c/gás");
    expect(fora).toContain("chimarrão");
    expect(fora).not.toContain("café");
  });
});

describe("função estomacal/intestinal", () => {
  function campoFuncao(funcaoEstomacal: string[]) {
    const a = createEmptyAssessment();
    a.funcaoEstomacal = funcaoEstomacal;
    const secoes = anamneseParaRelatorio(a, deriveResults(a));
    return secoes.flatMap((s) => s.fields).find((f) => f.label === "Função estomacal/intestinal");
  }

  it("aparece com o título estomacal/intestinal, incluindo flatulência excessiva", () => {
    expect(campoFuncao(["Azia", "Flatulência excessiva"])?.value).toBe("Azia, Flatulência excessiva");
    expect(campoFuncao(["Flatulência excessiva"])?.value).toBe("Flatulência excessiva");
  });

  it("não mantém o título antigo no relatório", () => {
    const a = createEmptyAssessment();
    a.funcaoEstomacal = ["Flatulência excessiva"];
    const campos = anamneseParaRelatorio(a, deriveResults(a)).flatMap((s) => s.fields);
    expect(campos.some((f) => f.label === "Função estomacal")).toBe(false);
  });

  it("leva flatulência excessiva ao resumo enviado para a análise", () => {
    const a = createEmptyAssessment();
    a.funcaoEstomacal = ["Flatulência excessiva"];
    expect(buildResumo(a, deriveResults(a))).toContain("Função estomacal/intestinal: Flatulência excessiva");
  });
});
