import { describe, expect, it } from "vitest";
import { pesoAntropometricoParaResumo } from "./anthropometry-groups";
import { deriveResults } from "./calculations";
import { painelClinicoParaRelatorio } from "./clinical-dashboard";
import { createEmptyAssessment } from "./initial-state";
import type { AnaliseIA, IndicadorAntropometrico } from "./types";

const analise: AnaliseIA = {
  resumoClinico: [],
  achados: { prioridade: [], monitorar: [], favoraveis: [] },
  estrategiaInicial: [], focoProximoRetorno: [], reavaliarRetorno: [],
};
const indicador = (valor: string, data = "2026-10-14", nome = "Peso"): IndicadorAntropometrico => ({
  id: `${nome}-${data}`, nome, valor, data, unidade: "kg",
});

describe("peso antropométrico do resumo", () => {
  it("prioriza o peso anexado, sem alterar o peso usado nos cálculos", () => {
    const a = { ...createEmptyAssessment(), peso: "82", pesoReferido: "90", indicadoresAntropometricos: [indicador("79,35")] };
    const d = deriveResults(a);
    expect(pesoAntropometricoParaResumo(a)).toBe(79.35);
    const painel = painelClinicoParaRelatorio(analise, a, d, null);
    const peso = painel.resumo.find(item => item.label === "PESO")?.valor ?? "";
    expect(Number(peso.split(" ")[0].replace(",", "."))).toBe(79.35);
    expect(d.pesoKg).toBe(82);
  });
  it("usa a avaliação mais recente sem confundir peso ideal e massa gorda", () => {
    const a = { ...createEmptyAssessment(), indicadoresAntropometricos: [indicador("82", "2026-09-01"), indicador("79,35"), indicador("60", "2026-10-15", "Peso ideal"), indicador("25", "2026-10-15", "Massa gorda")] };
    expect(pesoAntropometricoParaResumo(a)).toBe(79.35);
  });
  it("mantém o peso conferido na antropometria quando não há indicador anexado", () => {
    expect(pesoAntropometricoParaResumo({ ...createEmptyAssessment(), peso: "78,4", pesoReferido: "90" })).toBe(78.4);
  });
  it("não substitui uma avaliação ausente pelo peso referido", () => {
    expect(pesoAntropometricoParaResumo({ ...createEmptyAssessment(), pesoReferido: "90" })).toBeNull();
  });
});

describe("faixa cardíaca compartilhada no resumo", () => {
  it("usa 60% e 70% de 220 menos a idade: 108 a 126 bpm aos 40 anos", () => {
    const a = { ...createEmptyAssessment(), dataNascimento: "1986-10-14", dataAvaliacao: "2026-10-14" };
    const d = deriveResults(a);
    const faixa = painelClinicoParaRelatorio(analise, a, d, null).resumo.find(item => item.label === "FAIXA IDEAL DE BPM")?.valor ?? "";
    expect(faixa.match(/\d+/g)?.map(Number)).toEqual([108, 126]);
  });
  it("não inventa uma faixa sem idade", () => {
    const a = createEmptyAssessment();
    const painel = painelClinicoParaRelatorio(analise, a, deriveResults(a), null);
    expect(painel.resumo.some(item => item.label === "FAIXA IDEAL DE BPM")).toBe(false);
  });
});