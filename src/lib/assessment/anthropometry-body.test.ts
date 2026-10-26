import { expect, it } from "vitest";
import { bodyMeasurements, bodySite } from "./anthropometry-body";

it("separa os lados do paciente nas circunferências", () => {
  expect(bodySite("Braço esquerdo", "Circunferências")).toEqual({ view: "front", x: 224, y: 192 });
  expect(bodySite("Braço direito", "Circunferências")).toEqual({ view: "front", x: 136, y: 192 });
});
it("localiza tríceps e subescapular na vista posterior", () => {
  expect(bodySite("Tríceps", "Dobras cutâneas")?.view).toBe("back");
  expect(bodySite("Subescapular", "Dobras cutâneas")?.view).toBe("back");
  expect(bodySite("Bíceps", "Dobras cutâneas")?.view).toBe("front");
});
it("preserva cada valor e unidade original sem criar medidas ausentes", () => {
  const indicador = { id: "1", nome: "Cintura", valor: "82,5", unidade: "cm", data: "2026-10-25" };
  expect(bodyMeasurements([indicador], "Circunferências")).toEqual([{ indicador, site: { view: "front", x: 180, y: 209 } }]);
  expect(bodySite("Indicador desconhecido", "Circunferências")).toBeNull();
  expect(bodyMeasurements([], "Dobras cutâneas")).toEqual([]);
});