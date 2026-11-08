import { describe, expect, it, vi } from "vitest";
import { createExampleAssessment } from "./example-patient";
import { deriveResults } from "./calculations";
import { generateJornadaPDF } from "./jornada-pdf";

const captura = vi.hoisted(() => ({ textos: [] as { texto: string; pagina: number }[] }));

vi.mock("./pdf-report", () => ({ nomeArquivoPdf: () => "avaliacao.pdf" }));
vi.mock("jspdf", async (importOriginal) => {
  const real = await importOriginal<typeof import("jspdf")>();
  return {
    default: function (opcoes: ConstructorParameters<typeof real.default>[0]) {
      const doc = new real.default(opcoes);
      const text = doc.text.bind(doc);
      doc.text = ((...args: Parameters<typeof doc.text>) => {
        captura.textos.push({ texto: String(args[0]), pagina: doc.getNumberOfPages() });
        return text(...args);
      }) as typeof doc.text;
      vi.spyOn(doc, "save").mockReturnValue(doc);
      return doc;
    },
  };
});

describe("Paginação da Jornada em PDF", () => {
  it("mantém os três títulos na mesma página do primeiro card da seção", () => {
    captura.textos = [];
    const a = createExampleAssessment();
    generateJornadaPDF(a, deriveResults(a), null);
    for (const titulo of ["COMO VOCÊ ESTÁ HOJE", "COMO VAMOS CHEGAR LÁ", "ONDE VAMOS CHEGAR"]) {
      const indice = captura.textos.findIndex((item) => item.texto === titulo);
      expect(indice).toBeGreaterThan(-1);
      const secao = captura.textos[indice];
      const primeiroCard = captura.textos[indice + 1];
      expect(primeiroCard).toBeDefined();
      expect(primeiroCard?.pagina).toBe(secao?.pagina);
    }
  });
});