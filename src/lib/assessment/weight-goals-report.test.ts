import { expect, it } from "vitest";
import { calcularMetasPeso } from "./weight-goals";
import { deriveResults } from "./calculations";
import { createEmptyAssessment } from "./initial-state";
import { metasPesoIniciais } from "./weight-projection";
import { metasParaRelatorio } from "./weight-goals-report";

function resultado() {
  // Sem data de nascimento: o cálculo registra limitações, que não devem aparecer no relatório final.
  const a = { ...createEmptyAssessment(), peso: "100", altura: "1,75" };
  return calcularMetasPeso(a, deriveResults(a), metasPesoIniciais());
}

it("não inclui a seção Limitações da estimativa no relatório final", () => {
  const r = resultado();
  expect(r.limitacoes.length).toBeGreaterThan(0);
  const titulos = metasParaRelatorio(r).map((s) => s.titulo);
  expect(titulos).not.toContain("Limitações da estimativa");
  expect(titulos).not.toContain("Modelo dinâmico de perda de peso (Hall/NIH)");
});

it("não repete a nota do modelo de Hall em dois compartimentos", () => {
  const itens = metasParaRelatorio(resultado()).flatMap((s) => s.itens ?? []);
  expect(itens.some((i) => /dois compartimentos/i.test(i))).toBe(false);
  expect(itens.some((i) => /calculadora oficial/i.test(i))).toBe(false);
});

it("mantém as demais seções da projeção", () => {
  const titulos = metasParaRelatorio(resultado()).map((s) => s.titulo);
  expect(titulos).toEqual(
    expect.arrayContaining([
      "Dados da projeção",
      "Expectativa do paciente",
    ]),
  );
  expect(titulos).not.toContain("Metas clínicas de referência (ajustáveis)");
});
