import type { Assessment, MetodoTMB, Sexo } from "./types";

/** Idade em anos completos entre nascimento e a data de referência. */
export function calculateAge(dataNascimento: string, dataReferencia: string): number | null {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  const ref = dataReferencia ? new Date(dataReferencia) : new Date();
  if (Number.isNaN(nasc.getTime()) || Number.isNaN(ref.getTime())) return null;
  let idade = ref.getFullYear() - nasc.getFullYear();
  const m = ref.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < nasc.getDate())) idade -= 1;
  return idade >= 0 ? idade : null;
}

/** Altura sempre em centímetros. */
export function alturaEmCm(valor: string, unidade: "cm" | "m"): number | null {
  const n = parseNumero(valor);
  if (n === null) return null;
  const cm = unidade === "m" ? n * 100 : n;
  return cm > 0 ? cm : null;
}

export function parseNumero(valor: string): number | null {
  if (valor === undefined || valor === null) return null;
  const normalizado = String(valor).trim().replace(",", ".");
  if (normalizado === "") return null;
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : null;
}

export function calculateBMI(pesoKg: number, alturaCm: number): number | null {
  if (pesoKg <= 0 || alturaCm <= 0) return null;
  const m = alturaCm / 100;
  return pesoKg / (m * m);
}

export function classificarIMC(imc: number): string {
  if (imc < 18.5) return "Baixo peso";
  if (imc < 25) return "Eutrofia";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade grau I";
  if (imc < 40) return "Obesidade grau II";
  return "Obesidade grau III";
}

export function calculateBodyFatMass(pesoKg: number, percentual: number): number {
  return pesoKg * (percentual / 100);
}

export function calculateLeanMass(pesoKg: number, massaGorda: number): number {
  return pesoKg - massaGorda;
}

export function calculateHarrisBenedict(
  sexo: Sexo,
  pesoKg: number,
  alturaCm: number,
  idade: number,
): number {
  return sexo === "masculino"
    ? 66.47 + 13.75 * pesoKg + 5.003 * alturaCm - 6.755 * idade
    : 655.1 + 9.563 * pesoKg + 1.85 * alturaCm - 4.676 * idade;
}

export function calculateMifflin(
  sexo: Sexo,
  pesoKg: number,
  alturaCm: number,
  idade: number,
): number {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  return sexo === "masculino" ? base + 5 : base - 161;
}

export function calculateTMB(
  metodo: MetodoTMB,
  sexo: Sexo,
  pesoKg: number,
  alturaCm: number,
  idade: number,
): number {
  return metodo === "harris-benedict"
    ? calculateHarrisBenedict(sexo, pesoKg, alturaCm, idade)
    : calculateMifflin(sexo, pesoKg, alturaCm, idade);
}

export function calculateVET(tmb: number, fatorAtividade: number): number {
  return tmb * fatorAtividade;
}

/** FcMax = 220 - Idade. */
export function calculateMaxHeartRate(idade: number): number {
  return 220 - idade;
}

/** Faixa de cardio recomendada: FcMax × 0,6 a FcMax × 0,7. */
export function calculateCardioRange(fcMax: number) {
  return { min: fcMax * 0.6, max: fcMax * 0.7 };
}

export function calculateWaterRequirement(pesoKg: number) {
  return { min: pesoKg * 30, max: pesoKg * 35 };
}

/** PIO applies only to overweight/obesity; retain full precision for hydration. */
export function calculateAdjustedWeight(pesoKg: number, alturaCm: number): number | null {
  const imc = calculateBMI(pesoKg, alturaCm);
  if (imc === null || imc < 25) return null;
  const pesoIdeal = 24.9 * (alturaCm / 100) ** 2;
  return (pesoKg - pesoIdeal) * 0.25 + pesoIdeal;
}

export function calculateCalorieDeficit(vet: number, percentual: number): number {
  return vet * (1 - percentual / 100);
}

export function calculateCalorieSurplus(vet: number, percentual: number): number {
  return vet * (1 + percentual / 100);
}

/** Duração entre dois horários HH:MM, considerando virada de meia-noite. */
export function calculateDurationMinutes(inicio: string, fim: string): number | null {
  const a = parseHora(inicio);
  const b = parseHora(fim);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff <= 0) diff += 24 * 60;
  return diff;
}

export function calculateSleepDuration(horaDormir: string, horaAcordar: string) {
  const minutos = calculateDurationMinutes(horaDormir, horaAcordar);
  if (minutos === null) return null;
  return { minutos, horas: Math.floor(minutos / 60), restoMinutos: minutos % 60 };
}

export function calculateWorkDuration(entrada: string, saida: string) {
  const minutos = calculateDurationMinutes(entrada, saida);
  if (minutos === null) return null;
  return { minutos, horas: Math.floor(minutos / 60), restoMinutos: minutos % 60 };
}

function parseHora(valor: string): number | null {
  if (!valor) return null;
  const partes = valor.split(":");
  if (partes.length < 2) return null;
  const h = Number(partes[0]);
  const m = Number(partes[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

export interface DerivedResults {
  idade: number | null;
  alturaCm: number | null;
  pesoKg: number | null;
  imc: number | null;
  classificacaoIMC: string | null;
  pio: number | null;
  percentualGordura: number | null;
  massaGorda: number | null;
  massaLivreGordura: number | null;
  tmb: number | null;
  fatorAtividade: number | null;
  vet: number | null;
  aguaMin: number | null;
  aguaMax: number | null;
  caloriasSugeridas: number | null;
  percentualAjuste: number | null;
  ajusteKcal: number | null;
  fcMax: number | null;
  cardioMin: number | null;
  cardioMax: number | null;
  sono: { horas: number; restoMinutos: number } | null;
  jornada: { horas: number; restoMinutos: number } | null;
}

/** Todos os valores derivados. Nada arredondado aqui — arredonde só na exibição. */
export function deriveResults(a: Assessment): DerivedResults {
  const idade = calculateAge(a.dataNascimento, a.dataAvaliacao);
  const alturaCm = alturaEmCm(a.altura, a.alturaUnidade);
  const pesoKg = parseNumero(a.peso);
  const percentualGordura = parseNumero(a.percentualGordura);

  const imc = pesoKg !== null && alturaCm !== null ? calculateBMI(pesoKg, alturaCm) : null;
  const pio = pesoKg !== null && alturaCm !== null ? calculateAdjustedWeight(pesoKg, alturaCm) : null;
  const massaGorda =
    pesoKg !== null && percentualGordura !== null
      ? calculateBodyFatMass(pesoKg, percentualGordura)
      : null;
  const massaLivreGordura =
    pesoKg !== null && massaGorda !== null ? calculateLeanMass(pesoKg, massaGorda) : null;

  const tmb =
    pesoKg !== null && alturaCm !== null && idade !== null && a.sexo !== ""
      ? calculateTMB(a.metodoTMB, a.sexo, pesoKg, alturaCm, idade)
      : null;

  const fatorAtividade = parseNumero(a.fatorAtividade);
  const vet = tmb !== null && fatorAtividade !== null ? calculateVET(tmb, fatorAtividade) : null;

  const agua = pesoKg !== null ? calculateWaterRequirement(pio ?? pesoKg) : null;

  const percentualAjuste = parseNumero(a.percentualAjuste);
  const kcalAjuste = parseNumero(a.kcalAjuste);
  const modoKcal = a.estrategia !== "normocalorica" && a.tipoAjuste === "kcal";
  let caloriasSugeridas: number | null = null;
  if (vet !== null) {
    if (a.estrategia === "normocalorica") {
      caloriasSugeridas = parseNumero(a.caloriasManuais) ?? vet;
    } else if (modoKcal && kcalAjuste !== null) {
      caloriasSugeridas =
        a.estrategia === "deficit" ? vet - kcalAjuste : vet + kcalAjuste;
    } else if (!modoKcal && percentualAjuste !== null) {
      caloriasSugeridas =
        a.estrategia === "deficit"
          ? calculateCalorieDeficit(vet, percentualAjuste)
          : calculateCalorieSurplus(vet, percentualAjuste);
    }
  }

  return {
    idade,
    alturaCm,
    pesoKg,
    imc,
    classificacaoIMC: imc !== null ? classificarIMC(imc) : null,
    pio,
    percentualGordura,
    massaGorda,
    massaLivreGordura,
    tmb,
    fatorAtividade,
    vet,
    aguaMin: agua?.min ?? null,
    aguaMax: agua?.max ?? null,
    caloriasSugeridas,
    percentualAjuste,
    ajusteKcal: modoKcal ? kcalAjuste : null,
    fcMax: idade !== null ? calculateMaxHeartRate(idade) : null,
    cardioMin: null,
    cardioMax: null,
    sono: calculateSleepDuration(a.horaDormir, a.horaAcordar),
    jornada: calculateWorkDuration(a.entradaTrabalho, a.saidaTrabalho),
  };
}

// ---- Formatação (arredondamento apenas na exibição) ----

export const fmtInt = (n: number | null | undefined) =>
  n === null || n === undefined ? "—" : Math.round(n).toLocaleString("pt-BR");

export const fmt2 = (n: number | null | undefined) =>
  n === null || n === undefined
    ? "—"
    : n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtLitros = (ml: number | null | undefined) =>
  ml === null || ml === undefined
    ? "—"
    : (ml / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtData = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

export const labelEstrategia: Record<string, string> = {
  deficit: "Déficit calórico",
  normocalorica: "Normocalórica",
  superavit: "Superávit calórico",
};

export const labelMetodo: Record<string, string> = {
  "harris-benedict": "Harris-Benedict",
  mifflin: "Mifflin-St Jeor",
};
