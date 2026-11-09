import { describe, expect, it } from "vitest";
import { createExampleAssessment, createExampleAtypicalDay } from "./example-patient";

describe("Paciente de exemplo", () => {
  it("usa o nome solicitado", () => {
    expect(createExampleAssessment().nome).toBe("Kamilla Cristina Salgado Bilinski");
  });
  it("informa prática de atividade física", () => {
    expect(createExampleAssessment().praticaAtividadeFisica).toBe("sim");
  });
  it("informa peso relatado de 74 kg", () => {
    expect(createExampleAssessment().pesoReferido).toBe("74");
  });
  it("informa altura relatada de 1,60 m", () => {
    expect(createExampleAssessment().alturaReferida).toBe("1,60");
  });
  it("informa profissão Professora", () => {
    expect(createExampleAssessment().profissao).toBe("Professora");
  });
  it("inclui pizza no jantar atípico sem alterar o jantar habitual", () => {
    const habitual = createExampleAssessment();
    const atipico = createExampleAtypicalDay();
    expect(atipico.find(meal => meal.refeicao === "Jantar")?.alimentos.map(item => item.alimento)).toEqual(["Pizza"]);
    expect(habitual.diarioAlimentar.find(meal => meal.refeicao === "Jantar")?.alimentos.map(item => item.alimento)).not.toContain("Pizza");
    expect(atipico.some(meal => habitual.diarioAlimentar.some(original => original.id === meal.id))).toBe(false);
  });
});