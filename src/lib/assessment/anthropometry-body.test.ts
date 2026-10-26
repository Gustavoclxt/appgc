import { expect, it } from "vitest";
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
it("preserva cada valor e unidade original sem criar medidas ausentes", () => {
  const indicador = { id: "1", nome: "Cintura", valor: "82,5", unidade: "cm", data: "2026-10-25" };
  expect(bodyMeasurements([indicador], "Circunferências", "masculino")).toEqual([{ indicador, site: { view: "front", x: 180, y: 207 } }]);
  expect(bodySite("Indicador desconhecido", "Circunferências", "feminino")).toBeNull();
  expect(bodyMeasurements([], "Dobras cutâneas", "masculino")).toEqual([]);
});
