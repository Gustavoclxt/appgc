import { describe, expect, it } from "vitest";
import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { buildResumo } from "./summary";
import type { ComposicaoDiario } from "./diet-composition";

describe("dados completos para análise", () => {
  it("preserva horários reais de trabalho além da duração", () => {
    const a = { ...createEmptyAssessment(), entradaTrabalho: "07:35", saidaTrabalho: "18:45" };
    const resumo = buildResumo(a, deriveResults(a));
    expect(resumo).toContain(a.entradaTrabalho);
    expect(resumo).toContain(a.saidaTrabalho);
  });
  it("transmite histórico de todas as fases e observações sem reinterpretar", () => {
    const a = { ...createEmptyAssessment(), historicoPeso: "Infância: obesidade aos 8 anos\nAdolescência: 82 kg\nVida adulta: 91 kg\nGestação: ganho de 12 kg", observacoesFome: "Fome durante o turno noturno", observacoesEvolucao: "Perda após mudança de turno", observacaoSuplemento: "Náusea após suplemento", observacoesRecordatorio: "Dia com visita familiar", observacoesPreferencias: { frutas: "Prefere maçã cozida" } };
    const resumo = buildResumo(a, deriveResults(a));
    for (const valor of [a.historicoPeso, a.observacoesFome, a.observacoesEvolucao, a.observacaoSuplemento, a.observacoesRecordatorio, a.observacoesPreferencias.frutas]) expect(resumo).toContain(valor);
  });
  it("preserva todas as características e justificativas do treino", () => {
    const modalidade = { id: "treino", modalidade: "Natação", tempoPratica: "7 meses", horario: "05:45", duracao: "55 minutos", frequenciaSemanal: "4 vezes", diasSemana: "Segunda, Quarta", diasDescanso: "Domingo", nota: "3", justificativa: "Fadiga após 20 minutos" };
    const a = { ...createEmptyAssessment(), modalidades: [modalidade] };
    const resumo = buildResumo(a, deriveResults(a));
    for (const [chave, valor] of Object.entries(modalidade)) if (chave !== "id") expect(resumo).toContain(valor);
  });
  it("transmite resposta negativa sobre exames e observações quando disponíveis", () => {
    const a = createEmptyAssessment();
    a.possuiExames = "nao";
    expect(buildResumo(a, deriveResults(a))).toContain("nao");
    a.possuiExames = "sim";
    a.observacoesExames = "Coleta após infecção recente";
    expect(buildResumo(a, deriveResults(a))).toContain(a.observacoesExames);
  });
  it("envia os quatro totais já calculados sem misturar dias", () => {
    const a = createEmptyAssessment();
    const c: ComposicaoDiario = { chave: "habitual", itens: [], totais: { kcal: 1546, carboidratos: 164.4, proteinas: 110, lipidios: 49.5 } };
    const resumo = buildResumo(a, deriveResults(a), c);
    for (const n of ["1.546", "164,40", "110,00", "49,50"]) expect(resumo).toContain(n);
    expect(buildResumo(a, deriveResults(a))).not.toContain("164,40");
  });
});