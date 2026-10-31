import { describe, expect, it, vi } from "vitest";
import { agruparItensPorRefeicao, calcularComposicaoDasRefeicoes, chaveDiario } from "./diet-composition";
import type { ItemComposicao, Refeicao } from "./types";

const refeicao = (alimento: string): Refeicao => ({
  id: alimento, refeicao: "Almoço", horario: "12:00", local: "Casa",
  alimentos: [{ id: alimento, alimento, quantidade: "100 g" }, { id: "vazio", alimento: "", quantidade: "" }],
});

describe("Cálculo separado por dia", () => {
  it("calcula somente alimentos preenchidos do dia atípico, sem incluir o habitual", async () => {
    const habitual = [refeicao("Arroz")];
    const atipico = [refeicao("Pizza")];
    const calcular = vi.fn().mockResolvedValue([
      { refeicao: "Almoço", alimento: "Pizza", quantidade: "100 g", kcal: 280.25, carboidratos: 30.1, proteinas: 12.2, lipidios: 12.3, fonte: "TACO" },
    ]);
    const resultado = await calcularComposicaoDasRefeicoes(atipico, calcular);
    expect(calcular).toHaveBeenCalledWith([{ refeicao: "Almoço", alimento: "Pizza", quantidade: "100 g" }]);
    expect(resultado.totais).toEqual({ kcal: 280.25, carboidratos: 30.1, proteinas: 12.2, lipidios: 12.3 });
    expect(resultado.chave).toBe(chaveDiario(atipico));
    expect(habitual[0]?.alimentos[0]?.alimento).toBe("Arroz");
  });

  it("somando as calorias de cada refeição no agrupamento, o total por grupo soma todos os itens", () => {
    const item = (alimento: string, refeicao: string, kcal: number): ItemComposicao =>
      ({ refeicao, alimento, quantidade: "100 g", kcal, carboidratos: 0, proteinas: 0, lipidios: 0, fonte: "" }) as ItemComposicao;
    const itens = [
      item("Arroz", "Almoço", 128.4),
      item("Feijão", "Almoço", 76.2),
      item("Pão", "Desjejum", 150),
    ];
    const refeicoes: Refeicao[] = [
      { id: "d", refeicao: "Desjejum", horario: "07:00", local: "Casa", alimentos: [] },
      { id: "a", refeicao: "Almoço", horario: "12:00", local: "Casa", alimentos: [] },
    ];
    const grupos = agruparItensPorRefeicao(itens, refeicoes);
    expect(grupos.find(g => g.nome === "Almoço")?.kcal).toBeCloseTo(204.6, 5);
    expect(grupos.find(g => g.nome === "Desjejum")?.kcal).toBeCloseTo(150, 5);
    expect(grupos.find(g => g.nome === "Desjejum")?.horario).toBe("07:00");
  });

  it("não envia um dia sem alimentos para cálculo", async () => {
    const calcular = vi.fn();
    await expect(calcularComposicaoDasRefeicoes([refeicao(" ")], calcular)).rejects.toThrow();
    expect(calcular).not.toHaveBeenCalled();
  });
});