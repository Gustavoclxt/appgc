import { describe, expect, it } from "vitest";

import { AGUA_MAX, escalaAgua, escalaAguaMeio, formatarLitros, formatarLitrosAgua, lerLitrosAgua } from "./hydration";

describe("slider de hidratação", () => {
  it("lê litros a partir do valor armazenado na sessão", () => {
    expect(lerLitrosAgua("1,5 L/dia")).toBe(1.5);
    expect(lerLitrosAgua("2 L/dia")).toBe(2);
    expect(lerLitrosAgua("0,25 L/dia")).toBe(0.25);
  });

  it("trata texto vazio ou livre como posição inicial zero", () => {
    expect(lerLitrosAgua("")).toBe(0);
    expect(lerLitrosAgua("3 copos")).toBe(0);
  });

  it("limita a leitura à faixa de 0 a 6 litros", () => {
    expect(lerLitrosAgua("9 L/dia")).toBe(6);
  });

  it("formata o número com vírgula e sem zeros à direita", () => {
    expect(formatarLitros(1.5)).toBe("1,5");
    expect(formatarLitros(0.25)).toBe("0,25");
    expect(formatarLitros(2)).toBe("2");
    expect(formatarLitros(0)).toBe("0");
  });

  it("acompanha o valor da unidade L/dia", () => {
    expect(formatarLitrosAgua(1.5)).toBe("1,5 L/dia");
    expect(formatarLitrosAgua(0)).toBe("0 L/dia");
  });

  it("marca a régua de 1 em 1 litro até 6 L", () => {
    expect(escalaAgua).toHaveLength(7);
    expect(escalaAgua[0]).toBe(0);
    expect(escalaAgua[3]).toBe(3);
    expect(escalaAgua[escalaAgua.length - 1]).toBe(AGUA_MAX);
  });

  it("marca os pontos de meio litro entre os números da régua", () => {
    expect(escalaAguaMeio).toHaveLength(6);
    expect(escalaAguaMeio[0]).toBe(0.5);
    expect(escalaAguaMeio[1]).toBe(1.5);
    expect(escalaAguaMeio[2]).toBe(2.5);
    expect(escalaAguaMeio[5]).toBe(5.5);
  });
});
