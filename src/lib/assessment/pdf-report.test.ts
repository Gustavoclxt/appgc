import { describe, expect, it, vi } from "vitest";
import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { somarTotais, type ComposicaoDiario } from "./diet-composition";

const { textos, arquivos } = vi.hoisted(() => ({
  textos: [] as string[],
  arquivos: [] as string[],
}));
vi.mock("jspdf", () => ({
  default: class {
    constructor() {
      return new Proxy(this, {
        get: (_target, key) => {
          if (key === "text") return (texto: string | string[]) => { textos.push(...(Array.isArray(texto) ? texto : [texto])); };
          if (key === "splitTextToSize") return (texto: string) => [texto];
          if (key === "getTextWidth") return (texto: string) => texto.length;
          if (key === "getNumberOfPages") return () => 1;
          if (key === "save") return (nome: string) => { arquivos.push(nome); };
          return () => this;
        },
      });
    }
  },
}));
import { generatePDF } from "./pdf-report";

function composicao(kcal: number, carboidratos: number): ComposicaoDiario {
  const itens = [{ refeicao: "Almoço", alimento: "Arroz", quantidade: "100 g", kcal, carboidratos, proteinas: 10, lipidios: 5, fonte: "TACO" }];
  return { chave: "teste", itens, totais: somarTotais(itens) };
}

describe("Composições independentes no PDF", () => {
  it("exporta os totais habitual e atípico sem somá-los", () => {
    textos.length = 0;
    const a = createEmptyAssessment();
    generatePDF(a, deriveResults(a), null, composicao(1546, 164.4), null, composicao(2300, 270));
    expect(textos.filter(t => /^\d[\d.]* kcal$/.test(t))).toEqual(["1.546 kcal", "2.300 kcal"]);
    expect(textos).not.toContain("3.846 kcal");
  });

  it("não exporta um dia atípico ausente", () => {
    textos.length = 0;
    const a = createEmptyAssessment();
    generatePDF(a, deriveResults(a), null, composicao(1546, 164.4));
    expect(textos.filter(t => /^\d[\d.]* kcal$/.test(t))).toEqual(["1.546 kcal"]);
  });
});

describe("Nome do arquivo do PDF", () => {
  it("usa mês por extenso, ano e nome completo do paciente", () => {
    arquivos.length = 0;
    const a = { ...createEmptyAssessment(), dataAvaliacao: "2026-10-28", nome: "Guilherme Calixto" };
    generatePDF(a, deriveResults(a), null, composicao(1546, 164.4));
    expect(arquivos).toEqual(["Avaliação de 1ª consulta Outubro 2026 - Guilherme Calixto.pdf"]);
  });

  it("mantém o nome completo do paciente com acentos e sobrenomes", () => {
    arquivos.length = 0;
    const a = { ...createEmptyAssessment(), dataAvaliacao: "2026-01-05", nome: "Mariana Souza Lima" };
    generatePDF(a, deriveResults(a), null, composicao(1546, 164.4));
    expect(arquivos).toEqual(["Avaliação de 1ª consulta Janeiro 2026 - Mariana Souza Lima.pdf"]);
  });
});