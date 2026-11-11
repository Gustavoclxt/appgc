import { describe, expect, it } from "vitest";
import { agruparAntropometria, categoriaAntropometrica, pesoAntropometricoAnexado, pesoAntropometricoParaResumo, podeAnexarExames, rotuloIndicador, valorComUnidade } from "./anthropometry-groups";

describe("categorias da antropometria", () => {
  it("organiza altura e peso em Medidas", () => {
    for (const nome of ["Altura", "Peso"]) expect(categoriaAntropometrica({ nome, unidade: "" })).toBe("Medidas");
  });
  it("organiza todas as circunferências solicitadas", () => {
    for (const nome of ["Ombro", "cintura", "quadril", "coxa esquerda", "panturrilha esquerda", "braço relaxado esquerdo", "braço contraído esquerdo", "peitoral", "abdômen", "coxa direita", "panturrilha direita", "braço relaxado direito", "braço contraído direito"]) expect(categoriaAntropometrica({ nome, unidade: "cm" })).toBe("Circunferências");
  });
  it("organiza todas as dobras solicitadas", () => {
    for (const nome of ["Bíceps", "tríceps", "axilar média", "tórax", "panturrilha medial", "abdominal", "suprailíaca", "subescapular", "coxa"]) expect(categoriaAntropometrica({ nome, unidade: "mm" })).toBe("Dobras cutâneas");
  });
  it("classifica região com unidade cm como circunferência, mesmo com nome de dobra", () => {
    // Dobras são sempre em mm; "Abdominal: 90,1 cm" em um PDF é circunferência.
    expect(categoriaAntropometrica({ nome: "Abdominal", unidade: "cm" })).toBe("Circunferências");
    expect(categoriaAntropometrica({ nome: "Abdominal", unidade: "cm" })).not.toBe("Dobras cutâneas");
    expect(categoriaAntropometrica({ nome: "Dobra abdominal", unidade: "cm" })).toBe("Dobras cutâneas");
  });
  it("organiza todos os resultados solicitados", () => {
    for (const nome of ["IMC", "% massa gorda", "% massa magra", "massa gorda", "massa magra", "soma de dobras", "razão cintura/quadril", "área muscular do braço (AMB)", "área de gordura do braço (AGB)"]) expect(categoriaAntropometrica({ nome, unidade: "" })).toBe("Resultados");
  });
  it("preserva valores e separa avaliações de datas diferentes", () => {
    const indicadores = [
      { id: "1", nome: "Peso", valor: "100", unidade: "kg", data: "2026-10-13" },
      { id: "2", nome: "Peso", valor: "101", unidade: "kg", data: "2026-09-13" },
    ];
    const grupos = agruparAntropometria(indicadores, "");
    expect(grupos.map(g => g.data)).toEqual(["2026-10-13", "2026-09-13"]);
    expect(grupos.flatMap(g => g.indicadores)).toEqual(indicadores);
  });
});

it("permite anexar exames somente com Sim", () => {
  expect(podeAnexarExames({ possuiExames: "sim" })).toBe(true);
  expect(podeAnexarExames({ possuiExames: "nao" })).toBe(false);
  expect(podeAnexarExames({ possuiExames: "" })).toBe(false);
});

describe("rótulo do indicador", () => {
  it("abrevia Dobra cutânea para DC", () => {
    expect(rotuloIndicador("Dobra cutânea abdominal")).toBe("DC Abdominal");
    expect(rotuloIndicador("Dobra cutânea Suprailíaca")).toBe("DC Suprailíaca");
    expect(rotuloIndicador("dobras cutâneas tricipital")).toBe("DC Tricipital");
    expect(rotuloIndicador("Tríceps")).toBe("Tríceps");
  });
});

describe("valor com unidade", () => {
  it("apresenta a unidade junto ao valor", () => {
    expect(valorComUnidade({ valor: "1,60", unidade: "m" })).toBe("1,6 m");
    expect(valorComUnidade({ valor: "73,10", unidade: "kg" })).toBe("73,1 kg");
    expect(valorComUnidade({ valor: "18,5", unidade: "%" })).toBe("18,5%");
    expect(valorComUnidade({ valor: "25,50", unidade: "kg/m²" })).toBe("25,5 kg/m²");
    expect(valorComUnidade({ valor: "2,00", unidade: "" })).toBe("2,0");
    expect(valorComUnidade({ valor: "", unidade: "" })).toBe("—");
  });
  it("exibe uma casa decimal sem alterar a medida original", () => {
    const medida = { valor: "112,54", unidade: "cm" };
    expect(valorComUnidade(medida)).toBe("112,5 cm");
    expect(medida.valor).toBe("112,54");
    expect(valorComUnidade({ valor: "16", unidade: "mm" })).toBe("16,0 mm");
    expect(valorComUnidade({ valor: "112.50 cm", unidade: "cm" })).toBe("112,5 cm");
  });
  it("mantém duas casas decimais nas Medidas (altura e peso)", () => {
    expect(valorComUnidade({ valor: "1,50", unidade: "m" }, "Medidas")).toBe("1,50 m");
    expect(valorComUnidade({ valor: "63,58", unidade: "Kg" }, "Medidas")).toBe("63,58 Kg");
    expect(valorComUnidade({ valor: "63,6 Kg", unidade: "" }, "Medidas")).toBe("63,60 Kg");
    expect(valorComUnidade({ valor: "63,58", unidade: "Kg" }, "Circunferências")).toBe("63,6 Kg");
  });
});
describe("pesoAntropometricoAnexado", () => {
  it("retorna null quando nenhuma antropometria foi anexada", () => {
    expect(pesoAntropometricoAnexado({ indicadoresAntropometricos: [], dataAvaliacaoAntropometrica: "" })).toBeNull();
  });

  it("retorna o peso medido mais recente da antropometria anexada", () => {
    const a = {
      dataAvaliacaoAntropometrica: "2026-11-01",
      indicadoresAntropometricos: [
        { id: "1", nome: "Peso", valor: "78,50", unidade: "kg", data: "2026-10-01" },
        { id: "2", nome: "Peso", valor: "79,00", unidade: "kg", data: "2026-11-01" },
        { id: "3", nome: "Cintura", valor: "90", unidade: "cm", data: "2026-11-01" },
      ],
    };
    expect(pesoAntropometricoAnexado(a)).toBe(79);
  });

  it("mantém o peso referido como alternativa apenas no resumo", () => {
    const base = { indicadoresAntropometricos: [], dataAvaliacaoAntropometrica: "", peso: "74" };
    expect(pesoAntropometricoAnexado(base)).toBeNull();
    expect(pesoAntropometricoParaResumo(base)).toBe(74);
  });
});
