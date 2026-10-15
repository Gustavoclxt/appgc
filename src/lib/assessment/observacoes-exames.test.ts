import { describe, expect, it } from "vitest";

import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { anamneseParaRelatorio } from "./report-anamnesis";
import { buildResumo } from "./summary";
import { observacoesExamesParaRelatorio } from "./anthropometry-groups";

/** Regra: as observações sobre os exames só existem enquanto o box "Exames laboratoriais" é exibido. */
const pacienteComAnotacao = () => {
  const a = createEmptyAssessment();
  a.observacoesExames = "Hemograma dentro da referência";
  return a;
};

const campoDoRelatorio = (a: ReturnType<typeof createEmptyAssessment>) =>
  anamneseParaRelatorio(a, deriveResults(a))
    .flatMap((s) => s.fields)
    .find((f) => f.label === "Observações sobre os exames");

describe("observações sobre os exames ligadas ao box de exames", () => {
  it("aparecem quando o box de exames está exibido", () => {
    const a = pacienteComAnotacao();
    a.possuiExames = "sim";

    expect(observacoesExamesParaRelatorio(a)).toBe("Hemograma dentro da referência");
    expect(campoDoRelatorio(a)?.value).toBe("Hemograma dentro da referência");
    expect(buildResumo(a, deriveResults(a))).toContain(
      "Observações sobre os exames: Hemograma dentro da referência",
    );
  });

  it("não aparecem quando a resposta é Não", () => {
    const a = pacienteComAnotacao();
    a.possuiExames = "nao";

    expect(observacoesExamesParaRelatorio(a)).toBe("");
    expect(campoDoRelatorio(a)).toBeUndefined();
    expect(buildResumo(a, deriveResults(a))).not.toContain("Hemograma dentro da referência");
  });

  it("não aparecem enquanto a pergunta fica sem resposta", () => {
    const a = pacienteComAnotacao();

    expect(observacoesExamesParaRelatorio(a)).toBe("");
    expect(campoDoRelatorio(a)).toBeUndefined();
  });
});
