import { describe, expect, it } from "vitest";
import { construirJornada, exameJornada } from "./jornada";
import { createExampleAssessment } from "./example-patient";
import { deriveResults } from "./calculations";

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

  it("meta hídrica usa 30 mL/kg/dia", () => {
    const a = createExampleAssessment();
    const d = deriveResults(a);
    const j = construirJornada(a, d, null);
    const agua = j.destino.habitos.linhas.find((l) => l.rotulo === "Água")!;
    expect(agua.valor).toContain(((d.pesoKg! * 30) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }).split(",")[0]);
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

  it("exame acima da referência aponta redução até o limite", () => {
    const e = exameJornada({ id: "1", exame: "LDL", resultado: "160", unidade: "mg/dL", referencia: "< 130", status: "acima" }, "LDL");
    expect(e.alvo).toBe("≤ 130 mg/dL");
    expect(e.diferenca).toBe("Reduzir ≈ 30 mg/dL");
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
});
