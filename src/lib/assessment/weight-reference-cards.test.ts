import { expect, it } from "vitest";
import { cardsMetasReferencia } from "./weight-goals-report";
import { calcularMetasPeso } from "./weight-goals";
import { deriveResults } from "./calculations";
import { createEmptyAssessment } from "./initial-state";
import { metasPesoIniciais } from "./weight-projection";

it("mantém as três referências e pesos resultantes para 100 kg", () => {
  const a = { ...createEmptyAssessment(), peso: "100", altura: "1,75" };
  const r = calcularMetasPeso(a, deriveResults(a), metasPesoIniciais());
  expect(cardsMetasReferencia(r)).toEqual([
    { prazo: "1 mês", percentual: "2,50%", perda: "2,50 kg", peso: "97,50 kg" },
    { prazo: "3 meses", percentual: "5,00%", perda: "5,00 kg", peso: "95,00 kg" },
    { prazo: "6 meses", percentual: "5,00 a 10,00%", perda: "5,00 a 10,00 kg", peso: "90,00 a 95,00 kg" },
  ]);
});

it("reflete referências ajustadas sem alterar o peso inicial", () => {
  const a = { ...createEmptyAssessment(), peso: "80" };
  const r = calcularMetasPeso(a, deriveResults(a), { ...metasPesoIniciais(), meta1: "3" });
  expect(cardsMetasReferencia(r)[0]).toEqual({ prazo: "1 mês", percentual: "3,00%", perda: "2,40 kg", peso: "77,60 kg" });
  expect(r.pesoInicial).toBe(80);
});