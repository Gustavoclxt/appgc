import { expect, it } from "vitest";
import { normalizarAnalise } from "./analysis-result";

it("não descarta achados e orientações ao considerar todas as questões", () => {
  const achados = Array.from({ length: 18 }, (_, i) => `Observação clínica ${i}`);
  const acoes = Array.from({ length: 7 }, (_, i) => `Considerar ação individualizada ${i}`);
  const resultado = normalizarAnalise({ resumoClinico: [], achados: { prioridade: achados, monitorar: [], favoraveis: [] }, estrategiaInicial: [{ categoria: "HÁBITOS ALIMENTARES", acoes }], focoProximoRetorno: [], reavaliarRetorno: achados });
  expect(resultado.achados.prioridade).toEqual(achados);
  expect(resultado.estrategiaInicial[0]?.acoes).toEqual(acoes);
  expect(resultado.reavaliarRetorno).toEqual(achados);
});