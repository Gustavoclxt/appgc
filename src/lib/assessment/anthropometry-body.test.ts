import { describe, expect, it } from "vitest";
import { bodyMeasurements, bodySite } from "./anthropometry-body";

it("separa os lados do paciente nas circunferências (silhueta feminina)", () => {
  expect(bodySite("Braço esquerdo", "Circunferências", "feminino")).toEqual({ view: "front", x: 230, y: 182 });
  expect(bodySite("Braço direito", "Circunferências", "feminino")).toEqual({ view: "front", x: 130, y: 182 });
});
it("usa a silhueta masculina quando o sexo é masculino", () => {
  expect(bodySite("Braço direito", "Circunferências", "masculino")).toEqual({ view: "front", x: 127, y: 178 });
  expect(bodySite("Braço esquerdo", "Circunferências", "masculino")).toEqual({ view: "front", x: 233, y: 178 });
});
it("localiza tríceps e subescapular na vista posterior", () => {
  expect(bodySite("Tríceps", "Dobras cutâneas", "masculino")?.view).toBe("back");
  expect(bodySite("Subescapular", "Dobras cutâneas", "masculino")?.view).toBe("back");
  expect(bodySite("Bíceps", "Dobras cutâneas", "feminino")?.view).toBe("front");
});
it("calibra quadril, panturrilha e dobras na silhueta masculina", () => {
  expect(bodySite("Quadril", "Circunferências", "masculino")).toEqual({ view: "front", x: 217, y: 258 });
  expect(bodySite("Panturrilha direita", "Circunferências", "masculino")).toEqual({ view: "front", x: 151, y: 415 });
  expect(bodySite("Panturrilha esquerda", "Circunferências", "masculino")).toEqual({ view: "front", x: 209, y: 415 });
  expect(bodySite("Axilar média", "Dobras cutâneas", "masculino")).toEqual({ view: "front", x: 147, y: 175 });
  expect(bodySite("Panturrilha medial", "Dobras cutâneas", "masculino")).toEqual({ view: "front", x: 154, y: 411 });
});
it("calibra quadril, axilar média e panturrilha medial na silhueta feminina", () => {
  expect(bodySite("Quadril", "Circunferências", "feminino")).toEqual({ view: "front", x: 206, y: 256 });
  expect(bodySite("Axilar média", "Dobras cutâneas", "feminino")).toEqual({ view: "front", x: 142, y: 172 });
  expect(bodySite("Panturrilha medial", "Dobras cutâneas", "feminino")).toEqual({ view: "front", x: 156, y: 433 });
});
it("une braço relaxado e contraído em um único ponto por lado", () => {
  for (const sexo of ["masculino", "feminino"] as const) {
    expect(bodySite("Braço contraído esquerdo", "Circunferências", sexo)).toEqual(bodySite("Braço relaxado esquerdo", "Circunferências", sexo));
    expect(bodySite("Braço contraído direito", "Circunferências", sexo)).toEqual(bodySite("Braço relaxado direito", "Circunferências", sexo));
  }
});
it("preserva cada valor e unidade original sem criar medidas ausentes", () => {
  const indicador = { id: "1", nome: "Cintura", valor: "82,5", unidade: "cm", data: "2026-10-25" };
  expect(bodyMeasurements([indicador], "Circunferências", "masculino")).toEqual([{ indicador, site: { view: "front", x: 180, y: 207 } }]);
  expect(bodySite("Indicador desconhecido", "Circunferências", "feminino")).toBeNull();
  expect(bodyMeasurements([], "Dobras cutâneas", "masculino")).toEqual([]);
});

import { idsAssimetricos as _ids } from "./anthropometry-body";
describe("idsAssimetricos", () => {
  const ind = (id: string, nome: string, valor: string) => ({ id, nome, valor, unidade: "cm", data: "" });
  it("marca os dois lados quando os valores diferem e ignora lados iguais", () => {
    const r = _ids([ind("1", "Coxa Direita", "56,5"), ind("2", "Coxa Esquerda", "56,0"), ind("3", "Panturrilha Direita", "36"), ind("4", "Panturrilha Esquerda", "36,0")], "Circunferências");
    expect([...r].sort()).toEqual(["1", "2"]);
  });
});
