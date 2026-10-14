import { describe, expect, it } from "vitest";

import { LOCAIS_REFEICAO, opcoesDeLocal } from "./food-diary";

describe("locais do recordatório 24h", () => {
  it("oferece exatamente os 12 locais, na ordem solicitada", () => {
    expect([...LOCAIS_REFEICAO]).toEqual([
      "Casa",
      "Trabalho",
      "Restaurante",
      "Escola",
      "Lanchonete",
      "Padaria",
      "Cafeteria",
      "Fast-food",
      "Em deslocamento",
      "Casa de familiares/amigos",
      "Academia",
      "Hotel",
    ]);
  });

  it("não duplica o local já selecionado", () => {
    expect(opcoesDeLocal("Casa")).toHaveLength(LOCAIS_REFEICAO.length);
  });

  it("mantém visível um local que não esteja na lista", () => {
    expect(opcoesDeLocal("Churrasco de domingo")).toContainEqual({
      value: "Churrasco de domingo",
      label: "Churrasco de domingo",
    });
  });
});
