import { describe, expect, it } from "vitest";
import { createExampleAssessment } from "./example-patient";
import { deriveResults } from "./calculations";
import { relatorioEstruturado } from "./report-structure";
import type { Refeicao } from "./types";

describe("Relatório na ordem do formulário", () => {
  const a = createExampleAssessment();
  const atipico: Refeicao[] = [{ id: "x", refeicao: "Almoço", horario: "13:00", local: "", alimentos: [{ id: "1", alimento: "Pizza", quantidade: "3 fatias" }] }];

  it("segue a sequência das etapas e inclui o dia atípico após o R24h", () => {
    const titulos = relatorioEstruturado(a, deriveResults(a), null, atipico, null, true).map((b) => b.titulo);
    const ordem = ["Informações pessoais", "Informações gerais e Objetivo", "História clínica", "Revisão de Sistemas e Sono", "Rotina de trabalho/faculdade", "Recordatório 24 horas", "Recordatório 24 horas — Dia atípico", "Evolução do peso", "Avaliação antropométrica", "Determinação do GET", "Metas e Projeção de Peso", "Frequência cardíaca para o cardio"];
    const idx = ordem.map((t) => titulos.indexOf(t));
    expect(idx.every((i) => i >= 0)).toBe(true);
    expect(idx).toEqual([...idx].sort((x, y) => x - y));
  });

  it("omite o dia atípico quando não existe", () => {
    const titulos = relatorioEstruturado(a, deriveResults(a), null, null, null).map((b) => b.titulo);
    expect(titulos).not.toContain("Recordatório 24 horas — Dia atípico");
  });

  it("omite os blocos de antropometria na exibição do aplicativo", () => {
    const titulos = relatorioEstruturado(a, deriveResults(a), null, null, null, false, false).map((b) => b.titulo);
    expect(titulos).not.toContain("Avaliação antropométrica");
    expect(titulos.some((t) => t.startsWith("Antropometria —"))).toBe(false);
    expect(titulos).toContain("Determinação do GET");
    const comAntropometria = relatorioEstruturado(a, deriveResults(a), null, null, null, false).map((b) => b.titulo);
    expect(comAntropometria).toContain("Avaliação antropométrica");
  });
});
