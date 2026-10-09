import { describe, expect, it } from "vitest";
import { calculateAdjustedWeight, deriveResults } from "./calculations";
import { createEmptyAssessment } from "./initial-state";

describe("PIO and hydration", () => {
  it("uses the specified ideal-weight and 0.25 adjustment formula", () => {
    expect(calculateAdjustedWeight(100, 200)).toBeCloseTo(99.7, 10);
  });
  it.each([100, 120, 140, 160])("applies to overweight and every obesity grade at %s kg", (peso) => {
    const d = deriveResults({ ...createEmptyAssessment(), altura: "2,00", peso: String(peso) });
    expect(d.pio).toBeCloseTo((peso - 99.6) * 0.25 + 99.6, 10);
  });
  it("uses unrounded PIO for both hydration endpoints", () => {
    const d = deriveResults({ ...createEmptyAssessment(), altura: "1,75", peso: "100" });
    expect(d.pio).toBeCloseTo(82.1921875, 10);
    expect(d.aguaMin).toBeCloseTo(2465.765625, 10);
    expect(d.aguaMax).toBeCloseTo(2876.7265625, 10);
  });
  it("retains actual-weight hydration below BMI 25", () => {
    const d = deriveResults({ ...createEmptyAssessment(), altura: "2,00", peso: "99" });
    expect(d.pio).toBeNull();
    expect(d.aguaMin).toBe(2970);
    expect(d.aguaMax).toBe(3465);
  });
  it("does not derive PIO or hydration without weight", () => {
    const d = deriveResults(createEmptyAssessment());
    expect(d.pio).toBeNull();
    expect(d.aguaMin).toBeNull();
  });
});

describe("energy adjustment presets", () => {
  const base = {
    ...createEmptyAssessment(),
    dataNascimento: "1990-05-10",
    sexo: "feminino" as const,
    altura: "1,75",
    peso: "78,4",
    fatorAtividade: "1.7",
    metodoTMB: "harris-benedict" as const,
    tipoAjuste: "percentual" as const,
  };

  it.each([
    ["25", 0.75],
    ["30", 0.7],
  ])("applies a %s%% deficit to the VET", (percentual, fator) => {
    const d = deriveResults({
      ...base,
      estrategia: "deficit" as const,
      percentualAjuste: percentual,
    });
    expect(d.vet).not.toBeNull();
    expect(d.caloriasSugeridas).toBeCloseTo((d.vet as number) * fator, 10);
  });

  it.each([
    ["25", 1.25],
    ["30", 1.3],
  ])("applies a %s%% surplus to the VET", (percentual, fator) => {
    const d = deriveResults({
      ...base,
      estrategia: "superavit" as const,
      percentualAjuste: percentual,
    });
    expect(d.caloriasSugeridas).toBeCloseTo((d.vet as number) * fator, 10);
  });
});