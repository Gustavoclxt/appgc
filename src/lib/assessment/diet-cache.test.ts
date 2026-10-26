import { expect, it } from "vitest";
import { comCacheDeComposicao, type CacheComposicao } from "./diet-composition";

it("recalcular o mesmo alimento mantém as mesmas calorias", async () => {
  let chamada = 0;
  const calc = comCacheDeComposicao(new Map() as CacheComposicao, async itens => {
    chamada++;
    return itens.map(i => ({ ...i, kcal: 100 * chamada, carboidratos: 0, proteinas: 0, lipidios: 0, fonte: "TACO" }));
  });
  const itens = [{ alimento: "Arroz", quantidade: "100 g", refeicao: "Almoço" }] as never;
  const a = await calc(itens);
  const b = await calc(itens);
  expect(a[0]!.kcal).toBe(100);
  expect(b[0]!.kcal).toBe(100);
});
