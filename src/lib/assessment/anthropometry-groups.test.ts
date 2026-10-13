import { describe, expect, it } from "vitest";
import { agruparAntropometria, categoriaAntropometrica, podeAnexarExames } from "./anthropometry-groups";

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