import { describe, expect, it } from "vitest";
import { construirJornada, exameJornada } from "./jornada";
import { createExampleAssessment, createExampleAssessmentAllan } from "./example-patient";
import { faixaEmGramas } from "./hypertrophy-potential";
import { deriveResults, fmt2, fmtInt } from "./calculations";

describe("Jornada de Recomposição Corporal", () => {
  it("usa o nome cadastrado no título", () => {
    const a = createExampleAssessment();
    const j = construirJornada(a, deriveResults(a), null);
    expect(j.titulo).toBe(`Jornada de Recomposição Corporal — ${a.nome}`);
  });

  it("exames: sem resultado, lista vazia e não avaliado; alterados são os únicos listados", () => {
    const a = { ...createExampleAssessment(), exames: [] };
    const j = construirJornada(a, deriveResults(a), null);
    expect(j.hoje.exames).toHaveLength(0);
    expect(j.examesAvaliados).toBe(false);
    expect(j.examesOk).toBe(false);

    const glicose = { id: "1", exame: "Glicose", resultado: "85", unidade: "mg/dL", referencia: "70 a 99", status: "dentro" as const };
    const dentro = { ...createExampleAssessment(), exames: [glicose] };
    const jDentro = construirJornada(dentro, deriveResults(dentro), null);
    expect(jDentro.examesOk).toBe(true);
    expect(jDentro.examesAvaliados).toBe(true);
    expect(jDentro.hoje.exames).toHaveLength(0);

    const comAcima = { ...createExampleAssessment(), exames: [glicose, { id: "2", exame: "LDL", resultado: "160", unidade: "mg/dL", referencia: "< 130", status: "acima" as const }] };
    const jAcima = construirJornada(comAcima, deriveResults(comAcima), null);
    expect(jAcima.examesOk).toBe(false);
    expect(jAcima.hoje.exames.map((e) => e.marcador)).toEqual(["LDL"]);
  });

  it.each(["2,1 L/dia", "3 L/dia"])("não pede aumento quando a ingestão %s atinge ou supera a meta", (consumoAgua) => {
    const a = { ...createExampleAssessment(), peso: "70", altura: "180", alturaUnidade: "cm" as const, consumoAgua, armstrong: "A7" };
    const d = deriveResults(a);
    expect(d.aguaMin).toBe(2100);
    const agua = construirJornada(a, d, null).caminho.habitos.linhas.find((l) => l.rotulo === "Água");
    expect(agua?.seta).toBe("igual");
    expect(agua?.tom).toBe("ok");
  });

  it("sugere aumento somente quando a ingestão conhecida está abaixo da meta", () => {
    const a = { ...createExampleAssessment(), peso: "70", altura: "180", alturaUnidade: "cm" as const, consumoAgua: "2 L/dia" };
    const d = deriveResults(a);
    expect(d.aguaMin).toBe(2100);
    expect(construirJornada(a, d, null).caminho.habitos.linhas.find((l) => l.rotulo === "Água")?.seta).toBe("up");
  });

  it("compara a ingestão com a meta baseada no PIO em vez do peso atual", () => {
    const a = { ...createExampleAssessment(), peso: "100", altura: "200", alturaUnidade: "cm" as const, consumoAgua: "2,995 L/dia" };
    const d = deriveResults(a);
    expect(d.pio).toBeCloseTo(99.7, 8);
    expect(d.aguaMin).toBeCloseTo(2991, 8);
    expect(construirJornada(a, d, null).caminho.habitos.linhas.find((l) => l.rotulo === "Água")?.seta).toBe("igual");
  });

  it("não presume necessidade de aumento quando faltam ingestão ou meta", () => {
    const base = createExampleAssessment();
    for (const a of [{ ...base, consumoAgua: "" }, { ...base, peso: "", consumoAgua: "3 L/dia" }]) {
      const agua = construirJornada(a, deriveResults(a), null).caminho.habitos.linhas.find((l) => l.rotulo === "Água");
      expect(agua?.seta).toBeNull();
      expect(agua?.tom).toBe("neutro");
    }
  });

  it("exames não têm status moderado: dentro da referência fica ok e não entra na lista", () => {
    const limite = { id: "1", exame: "Glicose", resultado: "74", unidade: "mg/dL", referencia: "70 a 99", status: "dentro" as const };
    expect(exameJornada(limite, "Glicose").tom).toBe("ok");
    const a = { ...createExampleAssessment(), exames: [limite] };
    const j = construirJornada(a, deriveResults(a), null);
    expect(j.hoje.exames).toHaveLength(0);
    expect(j.examesOk).toBe(true);
  });

  it("hábitos moderados: sono Moderada e Armstrong níveis 4 a 5", () => {
    const a = { ...createExampleAssessment(), qualidadeSono: "Moderada", armstrong: "A5" };
    const j = construirJornada(a, deriveResults(a), null);
    expect(j.hoje.habitos.linhas.find((l) => l.rotulo === "Sono")!.tom).toBe("moderado");
    expect(j.hoje.habitos.linhas.find((l) => l.rotulo === "Ingestão de água")!.tom).toBe("moderado");
    const alta = { ...createExampleAssessment(), armstrong: "A7" };
    expect(construirJornada(alta, deriveResults(alta), null).hoje.habitos.linhas.find((l) => l.rotulo === "Ingestão de água")!.tom).toBe("atencao");
  });

  it("álcool ocasional fica laranja (moderado); consumo diário fica vermelho", () => {
    const ocasional = createExampleAssessment();
    const jo = construirJornada(ocasional, deriveResults(ocasional), null);
    expect(jo.hoje.habitos.linhas.find((l) => l.rotulo === "Bebida alcoólica")!.tom).toBe("moderado");
    const diario = { ...createExampleAssessment(), etilismoFrequencia: "diariamente" };
    const jd = construirJornada(diario, deriveResults(diario), null);
    expect(jd.hoje.habitos.linhas.find((l) => l.rotulo === "Bebida alcoólica")!.tom).toBe("atencao");
  });

  it("exame acima da referência aponta redução até o limite", () => {
    const e = exameJornada({ id: "1", exame: "LDL", resultado: "160", unidade: "mg/dL", referencia: "< 130", status: "acima" }, "LDL");
    expect(e.alvo).toBe("≤ 130 mg/dL");
    expect(e.diferenca).toBe("Reduzir ≈ 30 mg/dL");
  });

  it("peso-alvo usa o peso desejado da anamnese e, sem ele, o PIO", () => {
    const a = createExampleAssessment();
    const d = deriveResults(a);
    const j = construirJornada(a, d, null);
    const linha = j.destino.composicao.linhas.find((l) => l.rotulo === "Peso-alvo")!;
    expect(linha.valor).toBe(`${fmt2(Number(a.pesoDesejado))} kg`);

    const semDesejado = { ...a, pesoDesejado: "" };
    const d2 = deriveResults(semDesejado);
    const j2 = construirJornada(semDesejado, d2, null);
    const linha2 = j2.destino.composicao.linhas.find((l) => l.rotulo === "Peso-alvo")!;
    expect(linha2.valor).toBe(d2.pio !== null ? `${fmt2(d2.pio)} kg` : "Não informado");
  });

  it("mostra Gordura visceral somente quando a antropometria traz esse indicador", () => {
    const sem = construirJornada(createExampleAssessment(), deriveResults(createExampleAssessment()), null);
    expect(sem.hoje.composicao.linhas.some((l) => l.rotulo === "Gordura visceral")).toBe(false);
    expect(sem.destino.composicao.linhas.some((l) => l.rotulo === "Gordura visceral")).toBe(false);

    const com = {
      ...createExampleAssessment(),
      indicadoresAntropometricos: [
        { id: "1", nome: "Gordura visceral", valor: "3", unidade: "", data: "2026-11-01" },
      ],
    };
    const j = construirJornada(com, deriveResults(com), null);
    const hoje = j.hoje.composicao.linhas.find((l) => l.rotulo === "Gordura visceral")!;
    expect(hoje.valor).toBe("3");
    expect(j.destino.composicao.linhas.find((l) => l.rotulo === "Gordura visceral")!.valor).toBe("Tendência de redução");
  });

  it("meta calórica diária usa o VET corrigido quando a correção por refeição livre está preenchida", () => {
    const a = { ...createExampleAssessment(), estrategia: "deficit" as const, refeicoesLivresSemana: "1", vetRefeicoesLivres: "1600" };
    const d = deriveResults(a);
    const j = construirJornada(a, d, null);
    const corrigido = ((d.caloriasSugeridas as number) * 7 - 1 * 1600) / 7;
    const linha = j.caminho.projecao.linhas.find((l) => l.rotulo === "Meta calórica diária")!;
    expect(linha.valor).toBe(`${fmtInt(corrigido)} kcal`);
    expect(linha.valor).not.toBe(`${fmtInt(d.caloriasSugeridas as number)} kcal`);
  });

  it("meta calórica diária usa a prescrição quando não há VET corrigido", () => {
    const a = { ...createExampleAssessment(), refeicoesLivresSemana: "", vetRefeicoesLivres: "" };
    const d = deriveResults(a);
    const linha = construirJornada(a, d, null).caminho.projecao.linhas.find((l) => l.rotulo === "Meta calórica diária")!;
    expect(linha.valor).toBe(`${fmtInt(d.caloriasSugeridas as number)} kcal`);
  });

  it("com Hipertrofia selecionada, a projeção da Jornada é de hipertrofia", () => {
    const a = createExampleAssessmentAllan();
    const d = deriveResults(a);
    const projecao = construirJornada(a, d, null).caminho.projecao;
    expect(projecao.titulo).toBe("Projeção de hipertrofia");
    expect(d.potencialHipertrofia).not.toBeNull();
    expect(projecao.linhas.find((l) => l.rotulo === "Potencial mensal de ganho muscular")!.valor).toBe(
      faixaEmGramas(d.potencialHipertrofia!.mensal),
    );
    expect(projecao.linhas.find((l) => l.rotulo === "Estágio de treinamento")!.valor).toBe(d.potencialHipertrofia!.estagio);
    expect(projecao.linhas.some((l) => l.rotulo === "Déficit calórico diário")).toBe(false);
    expect(projecao.linhas.some((l) => l.rotulo === "Peso desejado")).toBe(false);
  });

  it("com Emagrecimento selecionado, a projeção da Jornada continua de emagrecimento", () => {
    const a = createExampleAssessment();
    const projecao = construirJornada(a, deriveResults(a), null).caminho.projecao;
    expect(projecao.titulo).toBe("Projeção de emagrecimento");
    expect(projecao.linhas.some((l) => l.rotulo === "Potencial mensal de ganho muscular")).toBe(false);
  });
});
