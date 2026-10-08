import { describe, expect, it } from "vitest";
import { selecionarDias } from "./training-days";

describe.each(["Todos", "Nenhum"] as const)("exclusive %s selection", (global) => {
  it("replaces individual days when choosing the global option", () => {
    expect(selecionarDias("Segunda", ["Segunda", global], global)).toBe(global);
  });
  it("cancels when clicking the selected global option", () => {
    expect(selecionarDias(global, [], global)).toBe("");
  });
  it("switches immediately to an individual day", () => {
    expect(selecionarDias(global, [global, "Terça"], global)).toBe("Terça");
  });
  it("allows toggling multiple individual days", () => {
    expect(selecionarDias("Segunda", ["Segunda", "Quarta"], global)).toBe("Segunda, Quarta");
    expect(selecionarDias("Segunda, Quarta", ["Quarta"], global)).toBe("Quarta");
  });
});