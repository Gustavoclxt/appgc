import { describe, expect, it } from "vitest";
import {
  classificarExpectativa,
  diasParaMeta,
  metaReferencia,
  percentualReferenciaParaPrazo,
  pesoNoDia,
  simularHall,
} from "./weight-projection";

const ref = { meta1: 2.5, meta3: 5, meta6Max: 10 };

describe("metas de referência", () => {
  it("1 mês = 2,5% do peso inicial", () => {
    const m = metaReferencia("1 mês", 1, 2.5, 100);
    expect(m.kg).toBeCloseTo(2.5);
    expect(m.pesoMeta).toBeCloseTo(97.5);
    expect(m.kgMes).toBeCloseTo(2.5);
  });
  it("3 meses = 5% e 6 meses até 10%", () => {
    expect(percentualReferenciaParaPrazo(3, ref)).toBe(5);
    expect(percentualReferenciaParaPrazo(6, ref)).toBe(10);
    expect(percentualReferenciaParaPrazo(1, ref)).toBe(2.5);
  });
  it("classifica expectativa", () => {
    expect(classificarExpectativa(5, 5)).toBe("compativel");
    expect(classificarExpectativa(7, 5)).toBe("agressiva");
    expect(classificarExpectativa(10, 5)).toBe("muito-agressiva");
  });
});

describe("modelo dinâmico de Hall", () => {
  const base = { sexo: "feminino" as const, idade: 40, alturaCm: 165, pesoKg: 90, percentualGordura: 40, pal: 1.5 };
  it("sem déficit, o peso permanece estável", () => {
    const r = simularHall({ ...base, deficitKcal: 0 }, 365);
    expect(pesoNoDia(r.serie, 365)!).toBeCloseTo(90, 3);
  });
  it("perda desacelera ao longo do tempo (não linear)", () => {
    const r = simularHall({ ...base, deficitKcal: 500 }, 730);
    const p180 = 90 - pesoNoDia(r.serie, 180)!;
    const p360 = pesoNoDia(r.serie, 180)! - pesoNoDia(r.serie, 360)!;
    expect(p180).toBeGreaterThan(3);
    expect(p360).toBeLessThan(p180);
    expect(diasParaMeta(r.serie, 85)).not.toBeNull();
  });
});
