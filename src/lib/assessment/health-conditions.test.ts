import { describe, expect, it } from "vitest";
import { adicionarCondicao, condicoesSelecionadas, removerCondicao } from "./health-conditions";

describe("seleção de condições clínicas", () => {
  it("permite múltiplas doenças e inclusão de uma doença fora da lista", () => {
    const value = adicionarCondicao(adicionarCondicao("", "Anemia"), "Endometriose");
    expect(condicoesSelecionadas(value)).toEqual(["Anemia", "Endometriose"]);
  });
  it("remove somente a doença escolhida", () => {
    expect(removerCondicao("Anemia\nAnsiedade", "Anemia")).toBe("Ansiedade");
  });
  it("preserva históricos existentes e contexto familiar ao adicionar", () => {
    const original = "Mãe com diabetes tipo 2; pai hipertenso";
    expect(condicoesSelecionadas(adicionarCondicao(original, "Asma"))).toEqual([original, "Asma"]);
  });
  it("não repete uma doença nem adiciona um nome vazio", () => {
    expect(adicionarCondicao("Anemia", " anemia ")).toBe("Anemia");
    expect(adicionarCondicao("Anemia", "  ")).toBe("Anemia");
  });
});