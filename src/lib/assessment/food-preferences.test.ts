import { describe, expect, it } from "vitest";

import { comIntervalo } from "./selection-range";
import { aplicarSelecaoPreferencia } from "./food-preferences";
import { carboidratos, lacteos, leguminosas } from "./food-preferences";

describe("aplicarSelecaoPreferencia", () => {
  it("aplica o intervalo com Shift entre dois extremos, inclusive eles", () => {
    const propostos = comIntervalo(leguminosas, "Feijão", "Grão de bico", []);
    expect(aplicarSelecaoPreferencia([], propostos, leguminosas, "Grão de bico")).toEqual([
      "Feijão",
      "Lentilha",
      "Ervilha",
      "Soja",
      "Grão de bico",
    ]);
  });

  it("aplica o intervalo marcado em ordem inversa", () => {
    const propostos = comIntervalo(leguminosas, "Grão de bico", "Lentilha", ["Grão de bico"]);
    expect(aplicarSelecaoPreferencia(["Grão de bico"], propostos, leguminosas, "Lentilha")).toEqual([
      "Grão de bico",
      "Lentilha",
      "Ervilha",
      "Soja",
    ]);
  });

  it("trata intervalo que alcança “Todas” como seleção completa, sem “Nenhum”", () => {
    const propostos = comIntervalo(leguminosas, "Feijão", "Todas", []);
    expect(aplicarSelecaoPreferencia([], propostos, leguminosas, "Todas")).toEqual([
      "Feijão",
      "Lentilha",
      "Ervilha",
      "Soja",
      "Grão de bico",
      "Todas",
    ]);
  });

  it("trata intervalo que alcança “Nenhum” como nenhuma opção", () => {
    const propostos = comIntervalo(leguminosas, "Feijão", "Nenhum", []);
    expect(aplicarSelecaoPreferencia([], propostos, leguminosas, "Nenhum")).toEqual(["Nenhum"]);
  });

  it("mantém o clique simples em “Nenhum” substituindo os alimentos marcados", () => {
    expect(aplicarSelecaoPreferencia(["Leite", "Iogurte"], ["Leite", "Iogurte", "Nenhum"], lacteos, "Nenhum")).toEqual([
      "Nenhum",
    ]);
  });

  it("limpa a seleção quando “Todos” clicado de novo é desmarcado", () => {
    const atuais = ["Leite", "Iogurte", "Queijo", "Requeijão", "Todos"];
    expect(aplicarSelecaoPreferencia(atuais, atuais.filter((i) => i !== "Todos"), lacteos, "Todos")).toEqual([]);
  });

  it("remove “Nenhum” ao marcar um alimento", () => {
    expect(aplicarSelecaoPreferencia(["Nenhum"], ["Nenhum", "Arroz"], carboidratos, "Arroz")).toEqual(["Arroz"]);
  });

  it("mantém os demais alimentos ao desmarcar um deles", () => {
    expect(aplicarSelecaoPreferencia(["Arroz", "Macarrão"], ["Arroz"], carboidratos, "Macarrão")).toEqual(["Arroz"]);
  });

  it("preserva a seleção quando o Shift não altera nada", () => {
    expect(aplicarSelecaoPreferencia(["Nenhum"], ["Nenhum"], lacteos, "Nenhum")).toEqual(["Nenhum"]);
  });
});
