import { describe, expect, it } from "vitest";
import { DIAS_SEMANA, selecionarDias } from "./training-days";

const TODOS_OS_DIAS = DIAS_SEMANA.join(", ");

describe("selecionarDias — Todos", () => {
  it("seleciona todos os dias da semana", () => {
    expect(selecionarDias("Segunda", ["Segunda", "Todos"], "Todos")).toBe(TODOS_OS_DIAS);
  });
  it("mantém todos os dias ao clicar em Todos novamente", () => {
    expect(selecionarDias(TODOS_OS_DIAS, [...DIAS_SEMANA, "Todos"], "Todos")).toBe(TODOS_OS_DIAS);
  });
  it("permite remover um dia individual depois", () => {
    const restantes = DIAS_SEMANA.filter((d) => d !== "Quarta");
    expect(selecionarDias(TODOS_OS_DIAS, restantes, "Todos")).toBe(restantes.join(", "));
  });
  it("permite alternar dias individuais", () => {
    expect(selecionarDias("Segunda", ["Segunda", "Quarta"], "Todos")).toBe("Segunda, Quarta");
    expect(selecionarDias("Segunda, Quarta", ["Quarta"], "Todos")).toBe("Quarta");
  });
});

describe("selecionarDias — Nenhum", () => {
  it("substitui dias individuais ao escolher Nenhum", () => {
    expect(selecionarDias("Segunda", ["Segunda", "Nenhum"], "Nenhum")).toBe("Nenhum");
  });
  it("cancela ao clicar em Nenhum sem dias", () => {
    expect(selecionarDias("Nenhum", [], "Nenhum")).toBe("");
  });
  it("troca imediatamente para um dia individual", () => {
    expect(selecionarDias("Nenhum", ["Nenhum", "Terça"], "Nenhum")).toBe("Terça");
  });
  it("permite alternar múltiplos dias individuais", () => {
    expect(selecionarDias("Segunda", ["Segunda", "Quarta"], "Nenhum")).toBe("Segunda, Quarta");
    expect(selecionarDias("Segunda, Quarta", ["Quarta"], "Nenhum")).toBe("Quarta");
  });
});
