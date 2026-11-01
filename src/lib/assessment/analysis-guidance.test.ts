import { describe, expect, it } from "vitest";
import { orientacoesParaAnalise } from "./analysis-guidance";
import { createEmptyAssessment } from "./initial-state";
import type { Assessment } from "./types";

describe("revisão condicional das respostas", () => {
  const regras: { nome: string; ativa: Partial<Assessment>; inativa: Partial<Assessment> }[] = [
    { nome: "Não ao acompanhamento anterior", ativa: { jaFezDieta: "nao" }, inativa: { jaFezDieta: "sim" } },
    { nome: "Não aos exames recentes", ativa: { possuiExames: "nao" }, inativa: { possuiExames: "sim" } },
    { nome: "Sim ao plano de saúde", ativa: { planoSaude: "sim" }, inativa: { planoSaude: "nao" } },
    { nome: "Sim à alergia", ativa: { alergia: "sim" }, inativa: { alergia: "nao" } },
    { nome: "restrição vegetariana", ativa: { restricaoAlimentar: "vegetariano" }, inativa: { restricaoAlimentar: "nao" } },
    { nome: "restrição vegana", ativa: { restricaoAlimentar: "vegano" }, inativa: { restricaoAlimentar: "nao" } },
    { nome: "Sim aos EAAs", ativa: { eaas: "sim" }, inativa: { eaas: "nao" } },
    { nome: "Tabagista", ativa: { habitosSociais: ["Tabagista"] }, inativa: { habitosSociais: ["Nenhum"] } },
    { nome: "Etilista", ativa: { habitosSociais: ["Etilista"] }, inativa: { habitosSociais: ["Nenhum"] } },
    { nome: "Drogas", ativa: { habitosSociais: ["Drogas"] }, inativa: { habitosSociais: ["Nenhum"] } },
    { nome: "Sim a comer fora", ativa: { comeFora: "sim" }, inativa: { comeFora: "nao" } },
    { nome: "Sim a frituras", ativa: { consomeFritos: "sim" }, inativa: { consomeFritos: "nao" } },
    { nome: "frituras às vezes", ativa: { consomeFritos: "as-vezes" }, inativa: { consomeFritos: "nao" } },
    { nome: "outra pessoa prepara", ativa: { quemPrepara: "outra" }, inativa: { quemPrepara: "propria" } },
    { nome: "Sim a beliscos", ativa: { habitoBeliscar: "sim" }, inativa: { habitoBeliscar: "nao" } },
  ];
  for (const regra of regras) it(regra.nome, () => {
    const a = createEmptyAssessment();
    expect(orientacoesParaAnalise({ ...a, ...regra.ativa })).toHaveLength(1);
    expect(orientacoesParaAnalise({ ...a, ...regra.inativa })).toHaveLength(0);
    expect(orientacoesParaAnalise(a)).toHaveLength(0);
  });
});

describe("diretrizes da análise completa", () => {
  it("proíbe comentar divergência entre peso e altura referidos e aferidos", () => {
    expect(DIRETRIZES_ANALISE_COMPLETA).toContain("Peso e altura referidos x aferidos");
    expect(DIRETRIZES_ANALISE_COMPLETA).toContain("não deve ser comentada no relatório");
  });
});