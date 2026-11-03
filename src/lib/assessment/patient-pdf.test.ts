// ============= Full file contents =============
import { describe, expect, it, vi } from "vitest";

const { pontos, rotulos } = vi.hoisted(() => ({
  pontos: [] as { x: number; y: number }[],
  rotulos: [] as { texto: string; x: number }[],
}));

vi.mock("jspdf", () => ({
  default: class {
    constructor() {
      return new Proxy(this, {
        get: (_target, key) => {
          if (key === "circle") {
            return (x: number, y: number) => {
              pontos.push({ x, y });
              return this;
            };
          }
          if (key === "text") {
            return (texto: string | string[], x: number, _y: number, opcoes?: { align?: string }) => {
              if (opcoes?.align === "center") {
                for (const t of Array.isArray(texto) ? texto : [texto]) rotulos.push({ texto: t, x });
              }
              return this;
            };
          }
          if (key === "save") return () => this;
          return () => this;
        },
      });
    }
  },
}));

import { createExampleAssessment } from "./example-patient";
import { deriveResults } from "./calculations";
import { calcularMetasPeso } from "./weight-goals";
import { generatePatientPDF } from "./patient-pdf";

const xDe = (rotulo: string) => {
  const alvo = rotulos.filter((r) => r.texto === rotulo);
  if (alvo.length === 0) throw new Error(`marco ausente: ${rotulo}`);
  return alvo[0]!.x;
};

describe("Espaçamento das bolinhas da linha do tempo", () => {
  it("afasta 6 meses de 3 meses mais do que o intervalo mensal entre 1, 2 e 3 meses", () => {
    const a = { ...createExampleAssessment(), objetivos: ["Emagrecimento"] };
    const d = deriveResults(a);
    const metas = calcularMetasPeso(a, d, {
      modo: "peso",
      pesoDesejado: "78",
      kgPerder: "",
      prazoMeses: "",
      meta1: "",
      meta3: "",
      meta6Min: "",
      meta6Max: "",
      deficitKcal: "250",
    });
    pontos.length = 0;
    rotulos.length = 0;
    generatePatientPDF(a, d, metas);

    const x1 = xDe("1 mês");
    const x2 = xDe("2 meses");
    const x3 = xDe("3 meses");
    const x6 = xDe("6 meses");
    const mensal = x2 - x1;
    expect(x3 - x2).toBeCloseTo(mensal, 5);
    expect(x6 - x3).toBeGreaterThan(2 * mensal);
  });

  it("mantém 12 meses ainda mais afastado quando a projeção vai até 1 ano", () => {
    const a = { ...createExampleAssessment(), objetivos: ["Emagrecimento"] };
    const d = deriveResults(a);
    const metas = calcularMetasPeso(a, d, {
      modo: "peso",
      pesoDesejado: "70",
      kgPerder: "",
      prazoMeses: "",
      meta1: "",
      meta3: "",
      meta6Min: "",
      meta6Max: "",
      deficitKcal: "250",
    });
    pontos.length = 0;
    rotulos.length = 0;
    generatePatientPDF(a, d, metas);

    const x2 = xDe("2 meses");
    const x3 = xDe("3 meses");
    const x6 = xDe("6 meses");
    const x12 = xDe("12 meses");
    const mensal = x2 - xDe("1 mês");
    expect(x3 - x2).toBeCloseTo(mensal, 5);
    expect(x6 - x3).toBeGreaterThan(x3 - x2);
    expect(x12 - x6).toBeGreaterThan(x6 - x3);
    // as bolinhas ficam dentro da área útil da página
    expect(Math.min(...pontos.map((p) => p.x))).toBeGreaterThan(10);
    expect(Math.max(...pontos.map((p) => p.x))).toBeLessThan(287);
  });
});
