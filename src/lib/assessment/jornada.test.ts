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

  it("mostra 'Não informado' para exames ausentes e lista os 14 marcadores", () => {
    const a = { ...createExampleAssessment(), exames: [] };
    const j = construirJornada(a, deriveResults(a), null);
    expect(j.hoje.exames).toHaveLength(14);
    expect(j.hoje.exames.every((e) => e.inicial === "Não informado")).toBe(true);
  });

  it("meta hídrica usa 30 mL/kg/dia", () => {
    const a = createExampleAssessment();
    const d = deriveResults(a);
    const j = construirJornada(a, d, null);
    const agua = j.destino.habitos.linhas.find((l) => l.rotulo === "Água")!;
    expect(agua.valor).toContain(((d.pesoKg! * 30) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }).split(",")[0]);
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
