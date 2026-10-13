import { describe, expect, it } from "vitest";

import { comIntervalo } from "./selection-range";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

describe("comIntervalo", () => {
  it("seleciona o intervalo completo entre dois extremos, inclusive eles", () => {
    expect(comIntervalo(DIAS, "Segunda", "Domingo", [])).toEqual(DIAS);
  });

  it("mantém a ordem quando o clique vem depois do clique ancorado", () => {
    expect(comIntervalo(DIAS, "Terça", "Quinta", [])).toEqual(["Terça", "Quarta", "Quinta"]);
  });

  it("funciona quando o alvo vem antes do clicado (ordem inversa)", () => {
    expect(comIntervalo(DIAS, "Domingo", "Segunda", [])).toEqual(DIAS);
  });

  it("adiciona ao que já estava selecionado sem repetir valores", () => {
    expect(comIntervalo(DIAS, "Quinta", "Sexta", ["Sexta", "Domingo"])).toEqual([
      "Sexta",
      "Domingo",
      "Quinta",
    ]);
  });

  it("sem âncora, mantém a seleção inalterada", () => {
    expect(comIntervalo(DIAS, null, "Sexta", ["Segunda"])).toEqual(["Segunda"]);
  });

  it("alvo fora das opções mantém a seleção inalterada", () => {
    expect(comIntervalo(DIAS, "Segunda", "Todos", ["Segunda"])).toEqual(["Segunda"]);
  });
});
