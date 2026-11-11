import { describe, expect, it } from "vitest";

import { deriveResults } from "./calculations";
import {
  calcularPotencialHipertrofia,
  dataProjetada,
  faixaEmGramas,
  faixaEmKg,
  faixaPeso,
  objetivoPermiteHipertrofia,
  tempoPraticaEmMeses,
} from "./hypertrophy-potential";
import { createEmptyAssessment } from "./initial-state";
import { relatorioEstruturado } from "./report-structure";
import { relatorioParaCopia } from "./report-text";
import type { AnaliseIA, Modalidade } from "./types";

const analiseVazia: AnaliseIA = {
  resumoClinico: [],
  achados: { prioridade: [], monitorar: [], favoraveis: [] },
  estrategiaInicial: [],
  focoProximoRetorno: [],
  reavaliarRetorno: [],
};

const musculacao = (tempoPratica: string): Modalidade => ({
  id: "musculacao",
  modalidade: "Musculação",
  tempoPratica,
  horario: "",
  duracao: "",
  frequenciaSemanal: "",
  diasSemana: "",
  diasDescanso: "",
  nota: "",
  justificativa: "",
});

function avaliacao(tempo = "6 meses") {
  return {
    ...createEmptyAssessment(),
    sexo: "masculino" as const,
    peso: "82",
    objetivos: ["Hipertrofia"],
    modalidades: [musculacao(tempo)],
  };
}

describe("Elegibilidade e dados do Potencial de Hipertrofia", () => {
  it("limita a exibição a Hipertrofia e Recomposição corporal", () => {
    expect(objetivoPermiteHipertrofia(["Hipertrofia"])).toBe(true);
    expect(objetivoPermiteHipertrofia(["Recomposição corporal"])).toBe(true);
    expect(objetivoPermiteHipertrofia(["Emagrecimento"])).toBe(false);
    expect(objetivoPermiteHipertrofia(["Longevidade"])).toBe(false);
  });

  it("não calcula sem sexo, peso ou tempo válido de Musculação", () => {
    expect(calcularPotencialHipertrofia({ ...avaliacao(), sexo: "" }, 82)).toBeNull();
    expect(calcularPotencialHipertrofia(avaliacao(), null)).toBeNull();
    expect(calcularPotencialHipertrofia(avaliacao("tempo não informado"), 82)).toBeNull();
  });

  it("ignora o tempo de outras modalidades esportivas", () => {
    const a = {
      ...avaliacao(""),
      modalidades: [{ ...musculacao("10 anos"), id: "natacao", modalidade: "Natação" }],
    };
    expect(calcularPotencialHipertrofia(a, 82)).toBeNull();
  });

  it("interpreta meses, anos e períodos compostos", () => {
    expect(tempoPraticaEmMeses("6 meses")).toBe(6);
    expect(tempoPraticaEmMeses("2 anos")).toBe(24);
    expect(tempoPraticaEmMeses("1 ano e 6 meses")).toBe(18);
    expect(tempoPraticaEmMeses("1,5 anos")).toBe(18);
    expect(tempoPraticaEmMeses("6")).toBeNull();
  });
});

describe("Modelo de Lyle McDonald", () => {
  it.each([
    [0, "1º ano", 0.75, 11.5 / 12],
    [12, "2º ano", 4.5 / 12, 5.5 / 12],
    [24, "3º ano", 2.2 / 12, 2.7 / 12],
    [36, "4º ano em diante", 0.9 / 12, 1.3 / 12],
  ])("classifica %s meses como %s", (meses, estagio, min, max) => {
    const resultado = calcularPotencialHipertrofia(avaliacao(`${meses} meses`), 82);
    expect(resultado?.estagio).toBe(estagio);
    expect(resultado?.mensal.min).toBeCloseTo(min, 10);
    expect(resultado?.mensal.max).toBeCloseTo(max, 10);
  });

  it("usa 50% dos valores masculinos para mulheres", () => {
    const masculino = calcularPotencialHipertrofia(avaliacao(), 82);
    const feminino = calcularPotencialHipertrofia({ ...avaliacao(), sexo: "feminino" }, 62);
    expect(feminino?.mensal.min).toBeCloseTo((masculino?.mensal.min ?? 0) / 2, 10);
    expect(feminino?.mensal.max).toBeCloseTo((masculino?.mensal.max ?? 0) / 2, 10);
  });

  it("calcula 30, 45 e 60 dias pela taxa mensal atual sem arredondar", () => {
    const resultado = calcularPotencialHipertrofia(avaliacao(), 82);
    expect(resultado?.projecoes[0]?.ganho.min).toBeCloseTo(0.75, 10);
    expect(resultado?.projecoes[1]?.ganho.max).toBeCloseTo(1.4375, 10);
    expect(resultado?.projecoes[2]?.ganho.max).toBeCloseTo(23 / 12, 10);
    expect(resultado?.projecoes[0]?.peso.min).toBeCloseTo(82.75, 10);
  });

  it("divide o ano entre o 1º e o 2º ano quando o estágio muda", () => {
    const resultado = calcularPotencialHipertrofia(avaliacao("6 meses"), 82);
    expect(resultado?.anual.ganho.min).toBeCloseTo(6.75, 10);
    expect(resultado?.anual.ganho.max).toBeCloseTo(8.5, 10);
    expect(resultado?.anual.peso.min).toBeCloseTo(88.75, 10);
    expect(resultado?.anual.peso.max).toBeCloseTo(90.5, 10);
  });

  it("mantém um ano inteiro no 4º estágio após 36 meses", () => {
    const resultado = calcularPotencialHipertrofia(avaliacao("3 anos"), 82);
    expect(resultado?.anual.ganho.min).toBeCloseTo(0.9, 10);
    expect(resultado?.anual.ganho.max).toBeCloseTo(1.3, 10);
  });
});

describe("Integração com os resultados derivados e o relatório", () => {
  it("disponibiliza o mesmo resultado completo no relatório final", () => {
    const a = avaliacao();
    const d = deriveResults(a);
    const potencial = d.potencialHipertrofia;
    expect(potencial).not.toBeNull();
    if (!potencial) return;

    const bloco = relatorioEstruturado(a, d, null).find((item) => item.titulo === "Potencial de Hipertrofia");
    expect(bloco?.tipo).toBe("campos");
    if (bloco?.tipo !== "campos") return;
    const campos = Object.fromEntries(bloco.campos.map((campo) => [campo.label, campo.value]));
    expect(campos["Potencial mensal de ganho muscular"]).toBe(`${faixaEmGramas(potencial.mensal)}/mês`);
    expect(campos["Estágio de treinamento"]).toContain(potencial.estagio);
    expect(campos["Projeção para 30 dias"]).toBe(`Ganho muscular: ${faixaEmGramas(potencial.projecoes[0]!.ganho)} · Peso teórico: ${faixaPeso(potencial.projecoes[0]!.peso)}`);
    expect(campos["Projeção para 45 dias"]).toContain(faixaEmGramas(potencial.projecoes[1]!.ganho));
    expect(campos["Projeção para 60 dias"]).toContain(faixaPeso(potencial.projecoes[2]!.peso));
    expect(campos["Projeção para 1 ano"]).toBe(`Ganho muscular acumulado: ${faixaEmKg(potencial.anual.ganho)} · Peso teórico: ${faixaPeso(potencial.anual.peso)}`);
  });

  it("usa o peso importado mais recente sem alterar o peso dos cálculos energéticos", () => {
    const a = {
      ...avaliacao(),
      indicadoresAntropometricos: [
        { id: "antigo", nome: "Peso", valor: "90", unidade: "kg", data: "2026-09-01" },
        { id: "recente", nome: "Peso corporal", valor: "79,35", unidade: "kg", data: "2026-10-14" },
      ],
    };
    const d = deriveResults(a);
    expect(d.pesoKg).toBe(82);
    expect(d.potencialHipertrofia?.projecoes[0]?.peso.min).toBeCloseTo(80.1, 10);
  });

  it("omite o bloco do relatório para objetivos não elegíveis", () => {
    const a = { ...avaliacao(), objetivos: ["Emagrecimento"] };
    const blocos = relatorioEstruturado(a, deriveResults(a), null);
    expect(blocos.some((bloco) => bloco.titulo === "Potencial de Hipertrofia")).toBe(false);
  });

  it("acrescenta a ressalva de peso somente na recomposição corporal", () => {
    const a = { ...avaliacao(), objetivos: ["Recomposição corporal"] };
    const bloco = relatorioEstruturado(a, deriveResults(a), null).find((item) => item.titulo === "Potencial de Hipertrofia");
    expect(bloco?.tipo === "campos" && bloco.campos.some((campo) => campo.label === "Leitura na recomposição corporal" && campo.value.includes("pode permanecer estável ou até diminuir"))).toBe(true);
  });

  it("mantém os mesmos valores na cópia em texto puro e HTML", () => {
    const a = avaliacao();
    const d = deriveResults(a);
    const copia = relatorioParaCopia(a, d, analiseVazia, null);
    const linha30 = "Ganho muscular: 750,00 a 958,33 g · Peso teórico: 82,75 a 82,96 kg";
    expect(copia.texto).toContain("POTENCIAL DE HIPERTROFIA");
    expect(copia.texto).toContain(linha30);
    expect(copia.html).toContain("Potencial de Hipertrofia");
    expect(copia.html).toContain(linha30);
  });
});

describe("dataProjetada", () => {
  const base = new Date(2026, 10, 11); // 11/11/2026

  it("soma dias corridos à data base", () => {
    expect(dataProjetada(base, 30)).toBe("11/12/2026");
    expect(dataProjetada(base, 45)).toBe("26/12/2026");
  });

  it("atravessa a virada do ano", () => {
    expect(dataProjetada(base, 60)).toBe("10/01/2027");
    expect(dataProjetada(base, 365)).toBe("11/11/2027");
  });
});
