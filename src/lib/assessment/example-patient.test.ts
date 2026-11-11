import { describe, expect, it } from "vitest";
import { calculateAge } from "./calculations";
import {
  createExampleAssessment,
  createExampleAssessmentAllan,
  createExampleAtypicalDay,
  createExampleAtypicalDayAllan,
  EXEMPLOS_CLINICOS,
  proximoExemploClinico,
} from "./example-patient";

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
  it("informa peso desejado de 63 kg", () => {
    expect(createExampleAssessment().pesoDesejado).toBe("63");
  });
  it("informa frequência de álcool de 1x/mês", () => {
    expect(createExampleAssessment().etilismoFrequencia).toBe("1x/mês");
  });
  it("inclui uma lata de Coca Cola no jantar atípico", () => {
    const jantar = createExampleAtypicalDay().find(meal => meal.refeicao === "Jantar");
    expect(jantar?.alimentos.find(item => item.alimento === "Coca Cola")?.quantidade).toBe("1 lata");
  });
  it("inclui pizza no jantar atípico sem alterar o jantar habitual", () => {
    const habitual = createExampleAssessment();
    const atipico = createExampleAtypicalDay();
    expect(atipico.find(meal => meal.refeicao === "Jantar")?.alimentos.map(item => item.alimento)).toEqual(["Pizza", "Coca Cola"]);
    expect(habitual.diarioAlimentar.find(meal => meal.refeicao === "Jantar")?.alimentos.map(item => item.alimento)).not.toContain("Pizza");
    expect(atipico.some(meal => habitual.diarioAlimentar.some(original => original.id === meal.id))).toBe(false);
  });
});

describe("Segundo paciente de exemplo (Allan)", () => {
  const a = createExampleAssessmentAllan();
  it("usa o nome solicitado", () => {
    expect(a.nome).toBe("Allan Pinheiro Bilinski");
  });
  it("é do sexo masculino", () => {
    expect(a.sexo).toBe("masculino");
  });
  it("tem 39 anos", () => {
    expect(calculateAge(a.dataNascimento, "2026-11-11")).toBe(39);
  });
  it("informa altura referida de 1,82 m", () => {
    expect(a.alturaReferida).toBe("1,82");
  });
  it("informa peso relatado de 79 kg", () => {
    expect(a.pesoReferido).toBe("79");
  });
  it("tem objetivo de hipertrofia", () => {
    expect(a.objetivos).toEqual(["Hipertrofia"]);
  });
  it("registra 1,82 m e 79 kg na antropometria", () => {
    expect(a.altura).toBe("1.82");
    expect(a.peso).toBe("79");
  });
  it("usa o próprio recordatório atípico, sem os alimentos da paciente anterior", () => {
    const jantar = createExampleAtypicalDayAllan().find(meal => meal.refeicao === "Jantar");
    expect(jantar?.alimentos.map(item => item.alimento)).toEqual(["Picanha", "Pão de alho", "Cerveja"]);
    expect(a.diarioAlimentar.some(meal => meal.alimentos.some(item => item.alimento === "Pizza"))).toBe(false);
  });
});

describe("Alternância entre pacientes fictícios", () => {
  it("o primeiro clique preenche a paciente e o segundo, o Allan", () => {
    expect(proximoExemploClinico(-1)).toBe(0);
    expect(proximoExemploClinico(0)).toBe(1);
    expect(EXEMPLOS_CLINICOS[0]!.criar().nome).toBe("Kamilla Cristina Salgado Bilinski");
    expect(EXEMPLOS_CLINICOS[1]!.criar().nome).toBe("Allan Pinheiro Bilinski");
  });
  it("o terceiro clique volta à primeira paciente", () => {
    expect(proximoExemploClinico(1)).toBe(0);
  });
});