import { describe, expect, it } from "vitest";
import {
  calculateAdjustedWeight,
  calculateCardioRange,
  calculateMaxHeartRate,
  calculateTMB,
  deriveResults,
} from "./calculations";
import { createEmptyAssessment } from "./initial-state";

describe("Tinsley energy equations", () => {
  it("calculates PC as 24.8 × body weight in kg + 10 without unrelated inputs", () => {
    const d = deriveResults({ ...createEmptyAssessment(), peso: "80", metodoTMB: "tinsley-pc" });
    expect(d.tmb).toBe(1994);
  });
  it("calculates MLG as 25.9 × fat-free mass in kg + 284", () => {
    const d = deriveResults({ ...createEmptyAssessment(), peso: "80", percentualGordura: "25", metodoTMB: "tinsley-mlg" });
    expect(d.massaLivreGordura).toBe(60);
    expect(d.tmb).toBe(1838);
  });
  it("keeps full precision through TMB, VET and energy adjustment", () => {
    const d = deriveResults({ ...createEmptyAssessment(), peso: "78,43", percentualGordura: "22,37", metodoTMB: "tinsley-mlg", fatorAtividade: "1.7", estrategia: "deficit", tipoAjuste: "percentual", percentualAjuste: "15" });
    expect(d.massaLivreGordura).toBeCloseTo(60.885209, 10);
    expect(d.tmb).toBeCloseTo(1860.9279131, 10);
    expect(d.vet).toBeCloseTo(3163.57745227, 10);
    expect(d.caloriasSugeridas).toBeCloseTo(2689.0408344295, 10);
  });
  it.each(["tinsley-pc", "tinsley-mlg"] as const)("does not fabricate a result for %s without weight", metodoTMB => {
    const d = deriveResults({ ...createEmptyAssessment(), metodoTMB });
    expect(d.tmb).toBeNull();
    expect(d.vet).toBeNull();
  });
  it.each(["", "-5", "100", "105"])("does not fall back to another equation when MLG is missing or invalid (%s%%)", percentualGordura => {
    const d = deriveResults({ ...createEmptyAssessment(), peso: "80", percentualGordura, metodoTMB: "tinsley-mlg", sexo: "masculino", altura: "1,80", dataNascimento: "1990-01-01" });
    expect(d.tmb).toBeNull();
  });
  it.each(["tinsley-pc", "tinsley-mlg"] as const)("uses the same %s equation for either sex", metodo => {
    expect(calculateTMB(metodo, "feminino", 80, 170, 30, 60)).toBe(calculateTMB(metodo, "masculino", 80, 170, 30, 60));
  });
  it("preserves Harris-Benedict and Mifflin calculations", () => {
    expect(calculateTMB("harris-benedict", "masculino", 80, 180, 30)).toBeCloseTo(1864.36, 10);
    expect(calculateTMB("mifflin", "feminino", 80, 180, 30)).toBe(1614);
    expect(calculateTMB("mifflin", "", 80, null, null)).toBeNull();
  });
});

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

describe("cardio heart-rate range", () => {
  it("computes FcMax as 220 minus the age", () => {
    expect(calculateMaxHeartRate(40)).toBe(180);
  });
  it("bounds the cardio range at FcMax × 0,6 and FcMax × 0,7", () => {
    const faixa = calculateCardioRange(180);
    expect(faixa.min).toBeCloseTo(108, 10);
    expect(faixa.max).toBeCloseTo(126, 10);
  });
  it("derives FcMax and the cardio range from the birth date", () => {
    const d = deriveResults({ ...createEmptyAssessment(), dataNascimento: "1986-01-01" });
    expect(d.fcMax).toBe(220 - (d.idade as number));
    expect(d.cardioMin).toBeCloseTo((d.fcMax as number) * 0.6, 10);
    expect(d.cardioMax).toBeCloseTo((d.fcMax as number) * 0.7, 10);
  });
  it("does not derive FcMax without a birth date", () => {
    const d = deriveResults(createEmptyAssessment());
    expect(d.fcMax).toBeNull();
    expect(d.cardioMin).toBeNull();
    expect(d.cardioMax).toBeNull();
  });
});