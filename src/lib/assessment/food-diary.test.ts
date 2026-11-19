import { describe, expect, it } from "vitest";

import { LOCAIS_REFEICAO, numeralRomano, opcoesDeLocal } from "./food-diary";

describe("locais do recordatório 24h", () => {
  it("oferece exatamente os 13 locais, na ordem solicitada", () => {
    expect([...LOCAIS_REFEICAO]).toEqual([
      "Casa",
      "Trabalho",
      "Restaurante",
      "Escola",
      "Lanchonete",
      "Pizzaria",
      "Hamburgueria",

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

describe("numeralRomano", () => {
  it("numera as refeições em algarismos romanos, em sequência", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(numeralRomano)).toEqual([
      "I",
      "II",
      "III",
      "IV",
      "V",
      "VI",
      "VII",
      "VIII",
      "IX",
      "X",
    ]);
  });

  it("continua a numeração além de dez refeições", () => {
    expect(numeralRomano(11)).toBe("XI");
    expect(numeralRomano(14)).toBe("XIV");
    expect(numeralRomano(20)).toBe("XX");
  });
});
