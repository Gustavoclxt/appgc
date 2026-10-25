import { expect, it, vi } from "vitest";

vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (handler: (args: unknown) => unknown) => (args: unknown) => handler(args) }) }),
}));
vi.mock("./ai.server", () => ({ chatJSON: vi.fn() }));

import { analisarAvaliacao } from "./analysis.functions";
import { chatJSON } from "./ai.server";

it("não descarta achados e orientações ao considerar todas as questões", async () => {
  const achados = Array.from({ length: 18 }, (_, i) => `Observação clínica ${i}`);
  const acoes = Array.from({ length: 7 }, (_, i) => `Considerar ação individualizada ${i}`);
  vi.mocked(chatJSON).mockResolvedValue({ resumoClinico: [], achados: { prioridade: achados, monitorar: [], favoraveis: [] }, estrategiaInicial: [{ categoria: "HÁBITOS ALIMENTARES", acoes }], focoProximoRetorno: [], reavaliarRetorno: achados });
  const resultado = await analisarAvaliacao({ data: { resumo: "Dados preenchidos do paciente para avaliação" } });
  expect(resultado.achados.prioridade).toEqual(achados);
  expect(resultado.estrategiaInicial[0]?.acoes).toEqual(acoes);
  expect(resultado.reavaliarRetorno).toEqual(achados);
});