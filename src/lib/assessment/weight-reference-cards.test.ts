import { expect, it } from "vitest";
import { calcularMetasPeso } from "./weight-goals";
import { deriveResults } from "./calculations";
import { createEmptyAssessment } from "./initial-state";
import { metasPesoIniciais } from "./weight-projection";
import { cardsMetasReferencia } from "./weight-goals-report";

it("mantém as três referências e pesos resultantes para 100 kg", () => {
  const a = { ...createEmptyAssessment(), peso: "100", altura: "1,75" };
  const r = calcularMetasPeso(a, deriveResults(a), metasPesoIniciais());
  expect(r.metas.map(m => [m.meses, m.percentual, m.kg, m.pesoMeta])).toEqual([
    [1, 2.5, 2.5, 97.5], [3, 5, 5, 95], [6, 5, 5, 95], [6, 10, 10, 90],
  ]);
});

it("reflete referências ajustadas sem alterar o peso inicial", () => {
  const a = { ...createEmptyAssessment(), peso: "80" };
  const r = calcularMetasPeso(a, deriveResults(a), { ...metasPesoIniciais(), meta1: "3" });
  expect(r.metas[0]?.kg).toBeCloseTo(2.4);
  expect(r.metas[0]?.pesoMeta).toBeCloseTo(77.6);
  expect(r.pesoInicial).toBe(80);
});

it("mostra o peso após a perda na ordem da menor para a maior perda", () => {
  const a = { ...createEmptyAssessment(), peso: "100" };
  const r = calcularMetasPeso(a, deriveResults(a), metasPesoIniciais());
  const seisMeses = cardsMetasReferencia(r)[2];
  expect(seisMeses?.perda).toBe("5,00 a 10,00 kg");
  expect(seisMeses?.peso).toBe("95,00 a 90,00 kg");
});
