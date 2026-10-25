import { describe, expect, it } from "vitest";
import { createEmptyAssessment } from "./initial-state";
import { deriveResults } from "./calculations";
import { buildPatientBlock, newPatientProgress, patientBlockKeys, patientFilename, patientReviewWarnings, pendingPatientBlocks, resumePatientReport } from "./patient-report";

describe("Relatório independente do paciente", () => {
  it("usa exclusivamente o nome registrado no arquivo", () => {
    expect(patientFilename("Andre Pellin")).toBe("Relatório do Paciente - Andre Pellin.pdf");
    expect(() => patientFilename("")).toThrow();
  });
  it("não inventa prioridades quando faltam dados", () => {
    const a = createEmptyAssessment();
    expect(buildPatientBlock("C", a, deriveResults(a))).toEqual([]);
    expect(buildPatientBlock("D", a, deriveResults(a))).toEqual([]);
  });
  it("limita achados a três", () => {
    const a = { ...createEmptyAssessment(), maiorDificuldade: "Rotina", consumoAgua: "1 L", qualidadeSono: "Ruim", habitoBeliscar: "sim" as const };
    expect(buildPatientBlock("B", a, deriveResults(a))).toHaveLength(3);
  });
  it("limita prioridades a três com ação e acompanhamento", () => {
    const a = { ...createEmptyAssessment(), maiorDificuldade: "Rotina", consumoAgua: "1 L", qualidadeSono: "Ruim", habitoBeliscar: "sim" as const };
    const itens = buildPatientBlock("C", a, deriveResults(a));
    expect(itens).toHaveLength(3);
    expect(itens.every(i => i.texto && i.acao && i.acompanhamento)).toBe(true);
  });
  it("limita acompanhamento a quatro indicadores", () => {
    const a = { ...createEmptyAssessment(), peso: "80", objetivos: ["Emagrecimento"], maiorDificuldade: "Rotina", consumoAgua: "1 L", qualidadeSono: "Ruim", habitoBeliscar: "sim" as const };
    expect(buildPatientBlock("D", a, deriveResults(a))).toHaveLength(4);
  });
  it("sinaliza divergência e não apresenta composição derivada do peso divergente", () => {
    const a = { ...createEmptyAssessment(), peso: "80", pesoReferido: "75", percentualGordura: "30" };
    expect(patientReviewWarnings(a, deriveResults(a))[0]).toContain("divergem");
    expect(buildPatientBlock("A", a, deriveResults(a)).map(i => i.titulo)).not.toContain("Massa de gordura");
  });
  it("preserva checkpoints e retoma somente blocos interrompidos", async () => {
    const a = createEmptyAssessment();
    const keys = patientBlockKeys(a, deriveResults(a));
    let state = newPatientProgress();
    const calls: string[] = [];
    await expect(resumePatientReport(state, keys, b => { calls.push(b); if (b === "C") throw new Error("interrompido"); return [{ titulo: b, texto: b }]; }, p => { state = p; })).rejects.toThrow();
    expect(Object.keys(state.blocos)).toEqual(["A", "B"]);
    await resumePatientReport(state, keys, b => { calls.push(b); return []; }, p => { state = p; });
    expect(calls).toEqual(["A", "B", "C", "C", "D"]);
    expect(pendingPatientBlocks(state, keys)).toEqual([]);
  });
  it("integra novos dados sem descartar textos revisados", async () => {
    const a = createEmptyAssessment();
    const keys = patientBlockKeys(a, deriveResults(a));
    let state = await resumePatientReport(newPatientProgress(), keys, () => [], () => {});
    state.blocos.C = { chave: keys.C, editado: true, itens: [{ titulo: "Revisado", texto: "Texto da revisão" }] };
    const novo = { ...a, maiorDificuldade: "Horários" };
    const next = patientBlockKeys(novo, deriveResults(novo));
    state = await resumePatientReport(state, next, b => buildPatientBlock(b, novo, deriveResults(novo)), () => {});
    expect(state.blocos.C?.itens[0]?.texto).toBe("Texto da revisão");
    expect(state.blocos.B?.itens.some(i => i.texto.includes("Horários"))).toBe(true);
  });
});